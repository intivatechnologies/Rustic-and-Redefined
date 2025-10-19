const PORT = 8081;

const express = require('express');

//services
const http = require('http');
//const https = require('https');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();
const path = require('path');
const nodemailer = require('nodemailer');
const multer = require('multer');
const Algorithm = require('./assets/js/Algorithm.js');
const stripe = require('stripe')(process.env.STRIPE_KEY);

const PdfKit = require('pdfkit');

const app = express();

//handling one write queue at a time and awaiting each read after all writes

const JSON_ASSOCIATIONS = [
	'item_categories.json',
	'items.json',
	'marketplace_partners.json',
	'newsletter_subscriber_list.json'
];

//concatObjects
function combine(rootSrc, ...chain){
	const { dataNew, dataOld } = rootSrc;
	const newConcurrent = dataNew, oldConcurrent = dataOld;
	
	for(let concurrent of chain){
		newConcurrent = newConcurrent[concurrent];
		oldConcurrent = oldConcurrent[concurrent];
	}
		
	return oldConcurrent.concat(newConcurrent);
}

function concatenateObjects(a, b) {
	const result = { ...a };

	for (const key in b) {
		if (Array.isArray(a[key]) && Array.isArray(b[key]))
		  result[key] = a[key].concat(b[key]); // concatenate arrays
		else if (typeof a[key] === 'object' && typeof b[key] === 'object')
		  result[key] = concatObjects(a[key], b[key]); // recursively merge
		else
		  result[key] = b[key]; // overwrite primitives
	}

	return result;
}

//IO CALLBACKS
const IOCallbacks = {
	printAnyError(err){
		if(err)
			console.error(err);
	},
	
	requestSubscription: [
		(data) => {
			
		},
		
		(data, req) => {
			if (err){
				console.error(err);
				return res.status(500).json({ err: "failed to store subscriber." });
			}

			transporter.sendMail({
				from: process.env.NEWSLETTER_EMAIL,
				to: req.body.email,
				subject: "Please verify your email to keep up with our newsletter",
				html: getHeaderImageTag() + "To verify your email, click this link: "
					+ `<a href='${process.env.PORT_SERVER}/newsletter/request_subscription/${authentication}'>Click Here</a>`
			});
		
			return res.status(200).json({});
		}
	],
};

const JsonBackupOverrides = {
	itemCategories: (dataNew, dataOld) => {
		const dataset = { dataNew, dataOld },
		ic = combine(dataset, 'itemCategories'),
		ick = combine(dataset, 'itemCategoryKeys');
		
		return {
				// "itemCategories": dataOld.itemCategories.concat(dataNew.itemCategories),
				// "itemCategoryKeys": dataOld.itemCategoryKeys.concat(dataNew.itemCategoryKeys)
			"itemCategories": ic,
			"itemCategoryKeys": ick
		};
	},
	
	items: (dataNew, dataOld) => {
		return {
			"items": concatObjects(dataOld.items, dataNew.items)
		};
	},
	
	marketplacePartners: (dataNew, dataOld) => {
		const dataset = { dataNew, dataOld },
		mn = combine(dataset, 'marketplace', 'names'),
		ml = combine(dataset, 'marketplace', 'links');
		
		return {
			"marketplace": {
					// "names": dataOld.marketplace.names.concat(dataNew.marketplace.names),
					// "links": dataOld.marketplace.links.concat(dataNew.marketplace.links)
				"names": mn,
				"links": ml
			}
		};
	},
	
	newsletterSubscriberList: (dataNew, dataOld) => {
		const dataset = { dataNew, dataOld },
		s = combine(dataset, 'subscribers');
		
		return {
				// "subscribers": dataOld.subscribers.concat(dataNew.subscribers)
			"subscribers": s
		};
	}
};

class IOProcessor {
	constructor(){
		if(IOProcessor.instance)
			return IOProcessor.instance;
		else
			IOProcessor.instance = this;
		
		this.backups = [
			{ queue: [], overrideFunc: JsonBackupOverrides.itemCategories },
			{ queue: [], overrideFunc: JsonBackupOverrides.items },
			{ queue: [], overrideFunc: JsonBackupOverrides.marketplacePartners },
			{ queue: [], overrideFunc: JsonBackupOverrides.newsletterSubscriberList }
		];
		
		this.WAIT_PING = 500;
		this.READ_REFRESH = 25;
	}
	
	static getInstance(){
		if(!IOProcessor.instance)
			IOProcessor.instance = new IOProcessor();
		return IOProcessor.instance;
	}
	
	async write(fileIndex, data, callback){
		this.backups[fileIndex].queue.push(data);
		
		var stockpile = null;
		
		while(this.backups[fileIndex].queue.length !== 0)
			await new Promise(resolve => setTimeout(() => {
				if(this.backups[fileIndex].queue.length !== 0){
					//first queue
					stockpile = this.backups[fileIndex].queue.shift();
					
					for(let currentQueue of this.backups[fileIndex].queue)
						stockpile = this.backups[fileIndex].overrideFunc(stockpile, currentQueue);
				}
				
				resolve();
			}, this.WAIT_PING));
			
		await new Promise((resolve, reject) => {
			fs.writeFile(
				__dirname + ASSETS_JSON + JSON_ASSOCIATIONS[fileIndex],
				JSON.stringify(stockpile, null, '\t'),
				err => {
					if(err){
						console.error(err);
						reject(err);
					} else {
						callback(stockpile);
						resolve();
					}
				}
			);
		});
	}
	
	async read(fileIndex, callback){
		if(this.backups[fileIndex].queue.length !== 0){
			const interval = window.setInterval(() => {
				if(this.backups[index].queue.length === 0)
					window.clearInterval(interval);
			}, this.READ_REFRESH);
		}
		
		const data = await new Promise((resolve, reject) => {
			fs.readFile(
				__dirname + ASSETS_JSON + JSON_ASSOCIATIONS[file_index],
				(err, data) => {
					if(err){
						console.error(err);
						reject(err);
					} else
						resolve(JSON.parse(data));
				}
			);
		});
		
		return callback(data);
	}
}

//services initialization
const configOptionsCors = {
	//credentials: true,
	origin: process.env.PORT_CLIENT,
	methods: ['GET', 'POST'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	optionsSuccessStatus: 200
};

app.options('/test_message', cors(configOptionsCors));
app.use(cors(configOptionsCors));
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', process.env.PORT_CLIENT);
	next();
});

const TEMP_STORAGE = "/assets/images/file_upload/"
const IMAGES_ITEMS = "/assets/images/items/";
const ASSETS_JSON = "/assets/json/";
var storageAttachments = [{
	filename: "wood_cover.jpg",
	path: __dirname + "/assets/images/cover/wood_cover.jpg",
	cid: "header"
}];
function getHeaderImageTag(){
	return "<table align=\"center\"><td align=\"center\"><img src=\"cid:header\" alt=\"Header Image\" /></td></table>";
}

const emailStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, `.${TEMP_STORAGE}`);
	},

	filename: (req, file, cb) => {
		let fname = `Inquiry-${Date.now() + path.extname(file.originalname)}`;
		storageAttachments.push({
			filename: fname,
			path: __dirname + TEMP_STORAGE + fname
		});
		cb(null, fname);
	}
});
const uploadAttachments = multer({ storage: emailStorage });

//const emailSender = require('../modules/EmailSender/email_sender.js');
//const transporter = emailSender();
const transporter = nodemailer.createTransport({
    service: 'titan',
    auth: {
        user: process.env.NEWSLETTER_EMAIL,
        pass: process.env.NEWSLETTER_EMAIL_PASSWORD
    }
});

app.get('/dashboard/authentication/:loginId', bodyParser.json(), (req, res) => {
	let authentication = process.env.DASHBOARD_PASSWORD == req.params.loginId;
	res.status(200).json({ authentic: authentication });
});

const inquiryText = [];
app.post('/store_inquiry_contact', bodyParser.json(), (req, res) => {
	inquiryText.push(req.body.text);
	res.status(200).json({});
});

app.post('/send_inquiry_email', uploadAttachments.array("images"), (req, res) => {
	res.sendStatus(200);

	let text = "";
	if(inquiryText.length > 0)
		text = inquiryText.pop();

	transporter.sendMail({
		from: process.env.NEWSLETTER_EMAIL,
		to: process.env.CONTACT_EMAIL,
		subject: "Message received from rusticredefined.ca",
		html: getHeaderImageTag() + text,
		attachments: storageAttachments
	}).then(data => {
		for(let i = 1; i < storageAttachments.length; i++){
			fs.unlink(storageAttachments[i].path, err => {
				if(err)
					console.error(`Error deleting ${attachment.filename}`);
			});
		}

		storageAttachments = [];
	})
	.catch(err => { if(err) console.error(err); });
});

//NEWSLETTER

var newsletterList = [];
app.get('/newsletter/subscriber_list', bodyParser.json(), (req, res) => {
	fs.readFile(__dirname + ASSETS_JSON + "newsletter_subscriber_list.json", (err, data) => {
		if(err){
			console.error(err);
			res.status(500).json({});
			return;
		}

		newsletterList = [];
		data = JSON.parse(data);
		for(let sub of data.subscribers){
			if(sub.verified)
				newsletterList.push(sub.email);
		}

		res.status(200).json({ subscribers: newsletterList })
	});
});

app.post('/newsletter/request_subscription', bodyParser.json(), (req, res) => {
	let authentication = Date.now();
	let filePath = __dirname + ASSETS_JSON + "newsletter_subscriber_list.json";

	fs.readFile(filePath, (err, data) => {
		if(err){
			console.error(err);
			return res.status(500).json({});
		}

		data = JSON.parse(data);
		for(let sub of data.subscribers){
			if(sub.email === req.body.email){
				if(!sub.verified){
					authentication = sub.authentication;
					
					transporter.sendMail({
						from: process.env.NEWSLETTER_EMAIL,
						to: req.body.email,
						subject: "Please verify your email to keep up with our newsletter",
						html: getHeaderImageTag() + "To verify your email, click this link: "
							+ `<a href='${process.env.PORT_SERVER}/newsletter/request_subscription/${authentication}'>Click Here</a>`
					});
					
					return res.status(200).json({});
				} else
					return res.status(200).json({ code: 'already-verified' });
			}
		}

		data.subscribers.push({
			email: req.body.email,
			authentication: authentication,
			expiration: authentication + 14,
			verified: false
		});

		/*
		fs.writeFile(filePath, JSON.stringify(data, null, '\t'), err => {
			if (err){
				console.error(err);
				return res.status(500).json({ err: "failed to store subscriber." });
			}

			sendEmail();
			return res.status(200).json({});
		});
		*/
		
		/*
		//IOProcessor.write(fileIndex, data)
		IOProcessor.write(3, JSON.stringify(data, null, '\t'), err => {
			if (err){
				console.error(err);
				return res.status(500).json({ err: "failed to store subscriber." });
			}

			sendEmail();
			return res.status(200).json({});
		});
		*/
		
		IOProcessor.write(3, data, err => IOCallbacks.requestSubscription[1](data, req));
	});
});

app.get('/newsletter/request_subscription/:authentication', (req, res) => {
	res.redirect(`${process.env.PORT_CLIENT}/verify`);

	let auth = Number(req.params.authentication);
	let filePath = __dirname + ASSETS_JSON + "newsletter_subscriber_list.json";
	fs.readFile(filePath, (err, data) => {
		if(err){
			console.error(err);
			return;
		}

		data = JSON.parse(data);
		for(let i = 0; i < data.subscribers.length; i++){
			if(data.subscribers[i].authentication == auth){
				delete data.subscribers[i].expiration;
				data.subscribers[i].verified = true;
				break;
			}
		}

		/*
		fs.writeFile(filePath, JSON.stringify(data, null, '\t'), (err, data) => {
			if(err)
				console.error(err);
		});
		*/
		
		//IOProcessor.write(fileIndex, data)
		IOProcessor.write(3, data, err => IOCallbacks.printAnyError(err));
	});
});

var newsletterSubject;
var newsletterTextDivs;
var newsletterImagesPerLane;
app.post('/newsletter/send_text', bodyParser.json(), (req, res) => {
	newsletterSubject = req.body.subject;
	newsletterTextDivs = req.body.textDivs;
	newsletterImagesPerLane = req.body.imagesPerLane;
	res.sendStatus(200);
});

var newsletterAttachmentAmount = 0;
var newsletterAttachments = [];
const newsletterStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, `.${TEMP_STORAGE}`);
	},

	filename: (req, file, cb) => {
		let fname = `newsletter-attachment-${newsletterAttachmentAmount++}${path.extname(file.originalname)}`;
		newsletterAttachments.push({
			filename: fname,
			path: __dirname + TEMP_STORAGE + fname,
			cid: fname
		});
		cb(null, fname);
	}
});
const uploadNewsletterAttachment = multer({ storage: newsletterStorage });

app.post('/newsletter/send_images', uploadNewsletterAttachment.array("images"), (req, res) => {
	fs.readFile(__dirname + ASSETS_JSON + "newsletter_subscriber_list.json", (err, data) => {
		if(err){
			console.error(err);
			res.sendStatus(500);
			return;
		} else
			res.sendStatus(200);

		data = JSON.parse(data);

		//newsletter callback
		let pending = data.subscribers.length, messagesSent = 0;
		let pendingInterval = setInterval(() => {
			if(messagesSent >= pending){
				clearInterval(pendingInterval);
				newsletterSubject = "";
				newsletterTextDivs = [];
				newsletterImagesPerLane = [];
				newsletterAttachmentAmount = 0;
				newsletterAttachments = [];

				for(let attachment of newsletterAttachments)
					fs.unlink(attachment.path, err => {
						if(err)
							console.error(err);
					});
			}
		}, 50);

		let attachments = [storageAttachments[0]];
		for(let na of newsletterAttachments)
			attachments.push(na);
		
		let content = getHeaderImageTag() + '<br />';
		let attachmentKey = 0;
		for(let i = 0; i < newsletterTextDivs.length; i++){
			content += '<br />' + newsletterTextDivs[i];
			try{
				if(newsletterImagesPerLane[i]){
					for(let j = 0; j < newsletterImagesPerLane[i]; j++)
						content += `<br /><img src="cid:${newsletterAttachments[attachmentKey++].cid}" `
							+ "style=\"width: 225pt\" alt=\"Newsletter Attachment\" /><br />";
				}
			} catch(err){}
		}

		for(let sub of data.subscribers)
			transporter.sendMail({
				from: process.env.NEWSLETTER_EMAIL,
				to: sub.email,
				subject: newsletterSubject,
				attachments: attachments,
				html: content
					+ "<br /><br />The above message was sent using an automated email approach. "
					+ "Please do not respond to this email. To unsubscribe from this newsletter, click <a href="
					+ `"${process.env.PORT_SERVER}/newsletter/unsubscribe/${sub.authentication}">here.</a>`
			}, (err, info) => {
				++messagesSent;
				if(err)
					console.error(err);
			});
	});
});

app.get('/newsletter/unsubscribe/:authentication', (req, res) => {
	res.redirect(`${process.env.PORT_CLIENT}/unsubscribe`);

	let auth = Number(req.params.authentication);
	let filePath = __dirname + ASSETS_JSON + "newsletter_subscriber_list.json";

	fs.readFile(filePath, (err, data) => {
		if(err){
			console.error(err);
			return;
		}

		data = JSON.parse(data);
		for(let i = 0; i < data.subscribers.length; i++){
			if(data.subscribers[i].authentication == auth){
				data.subscribers.splice(i);
				break;
			}
		}

		/*
		fs.writeFile(filePath, JSON.stringify(data, null, '\t'), (err, data) => {
			if(err)
				console.error(err);
		});
		*/
		
		//IOProcessor.write(fileIndex, data)
		IOProcessor.write(3, JSON.stringify(data, null, '\t'), err => IOCallbacks.printAnyError(err));
	});
});

//PROJECTS
const IMAGES_PROJECTS = "/assets/images/projects/";

//SHOP
const IMAGES_SHOP = "/assets/images/shop/";

app.get('/item/categories', bodyParser.json(), (req, res) => {
	fs.readFile(__dirname + ASSETS_JSON + "item_categories.json", (err, data) => {
		if(err){
			res.status(500).json({});
			console.error(err);
			return;
		}

		data = JSON.parse(data);
		res.status(200).json({ itemCategories: data.itemCategories });
	});
});

app.get('/item/categories_and_keys', bodyParser.json(), (req, res) => {
	fs.readFile(__dirname + ASSETS_JSON + "item_categories.json", (err, data) => {
		if(err){
			res.status(500).json({});
			console.error(err);
			return;
		}

		data = JSON.parse(data);
		res.status(200).json({
			itemCategories: data.itemCategories,
			itemCategoryKeys: data.itemCategoryKeys
		});
	});
});

app.post('/item/add_category', bodyParser.json(), (req, res) => {
	let filePath = __dirname + ASSETS_JSON;
	let key = 0;

	fs.readFile(filePath + "item_categories.json", (err, data) => {
		if(err){
			console.error(err);
			res.status(500).json({});
		} else {
			data = JSON.parse(data);
			data.itemCategories.push(req.body.newCategory);
			
			//maximizes the chance that key is unique!
			let unique = false;
			while(!unique){
				unique = true;
				key = Date.now();
				
				for(let old_key of data.itemCategoryKeys)
					if(old_key === key){
						unique = false;
						break;
					}
			}
			data.itemCategoryKeys.push(key);
			
			/*
			fs.writeFile(filePath + "item_categories.json", JSON.stringify(data, null, '\t'), (err, data) => {
				if(err){
					console.error(err);
					res.status(500).json({});
				} else {
					fs.readFile(filePath + "items.json", (err, data) => {
						if(err){
							console.error(err);
							res.status(500).json({});
						} else {
							data = JSON.parse(data);
							data.items[key] = [];
							fs.writeFile(filePath + "items.json", JSON.stringify(data, null, '\t'), (err, data) => {
								if(err){
									console.error(err);
									res.status(500).json({});
								} else
									return res.status(200).json({ itemCategoryKey: key });
							});
						}
					});
				}
			});
			*/
			
			//IOProcessor.write(fileIndex, data)
			IOProcessor.write(0, JSON.stringify(data, null, '\t'), err => {
				if(err){
					console.error(err);
					res.status(500).json({});
				} else {
					fs.readFile(filePath + "items.json", (err, data) => {
						if(err){
							console.error(err);
							res.status(500).json({});
						} else {
							data = JSON.parse(data);
							data.items[key] = [];
							
							/*
							fs.writeFile(filePath + "items.json", JSON.stringify(data, null, '\t'), (err, data) => {
								if(err){
									console.error(err);
									res.status(500).json({});
								} else
									return res.status(200).json({ itemCategoryKey: key });
							});
							*/
							
							IOProcessor.write(1, JSON.stringify(data, null, '\t'), err => {
								if(err){
									console.error(err);
									res.status(500).json({});
								} else
									return res.status(200).json({ itemCategoryKey: key });
							});
						}
					});
				}
			});
		}
	});
});

app.post('/item/delete_category', bodyParser.json(), (req, res) => {
	let filePath = __dirname + ASSETS_JSON;
	fs.readFile(filePath + "item_categories.json", (err, data) => {
		if(err){
			console.error(err);
			return;
		}

		data = JSON.parse(data);
		let keyRemoved = data.itemCategoryKeys[req.body.index] + "";
		data.itemCategories = new Algorithm.DeleteAlgorithm(data.itemCategories).getProduct(req.body.index);
		data.itemCategoryKeys = new Algorithm.DeleteAlgorithm(data.itemCategoryKeys).getProduct(req.body.index);

		/*
		fs.writeFile(filePath + "item_categories.json", JSON.stringify(data, null, '\t'), err => {
			if(err){
				console.error(err);
				res.sendStatus(500);
			} else{
				fs.readFile(filePath + "items.json", (err, data) => {
					if(err){
						console.error(err);
						return;
					}

					data = JSON.parse(data);
					delete data.items[keyRemoved];
					fs.writeFile(filePath + "items.json", JSON.stringify(data, null, '\t'), err => {
						if(err){
							console.error(err);
							res.sendStatus(500);
						} else
							res.sendStatus(200);
					})
				});
			}
		});
		*/
		
		//IOProcessor.write(fileIndex, data)
		IOProcessor.write(0, JSON.stringify(data, null, '\t'), err => {
			if(err){
				console.error(err);
				res.sendStatus(500);
			} else{
				fs.readFile(filePath + "items.json", (err, data) => {
					if(err){
						console.error(err);
						return;
					}

					data = JSON.parse(data);
					delete data.items[keyRemoved];
					
					/*
					fs.writeFile(filePath + "items.json", JSON.stringify(data, null, '\t'), err => {
						if(err){
							console.error(err);
							res.sendStatus(500);
						} else
							res.sendStatus(200);
					});
					*/
					
					IOProcessor.write(1, JSON.stringify(data, null, '\t'), err => {
						if(err){
							console.error(err);
							res.sendStatus(500);
						} else
							res.sendStatus(200);
					});
				});
			}
		});
	});
});

app.post('/item/visit_category', bodyParser.json(), (req, res) => {
	let filePath = __dirname + ASSETS_JSON + "item_categories.json";
	fs.readFile(filePath, (err, data) => {
		if(err){
			console.error(err);
			return;
		}

		data = JSON.parse(data);
		return res.json({ itemCategoryKey: data.itemCategoryKeys[req.body.index] });
	});
});

var itemAwaitingFiles = null;
var itemImagePaths = [];
app.post('/item/post', bodyParser.json(), (req, res) => {
	itemAwaitingFiles = {
		itemCategoryKey: req.body.itemCategoryKey,
		itemKey: Date.now(),
		itemInfo: req.body.itemInfo,
		itemStoreIndex: 0,
		indexAt: req.body.indexAt,
		selectIndex: req.body.selectIndex,
		beforeLength: req.body.beforeLength,
		beforeImages: [],
		afterImages: []
	};
	itemImagePaths = [];
	res.status(200).json({});
});

const itemStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, __dirname + `/assets/images/items/`);
	},

	filename: (req, file, cb) => {
		let fname = `Item-${itemAwaitingFiles.itemKey}-${itemAwaitingFiles.itemStoreIndex++}`
			+ `${path.extname(file.originalname)}`;

		itemImagePaths.push({
			filename: fname,
			path: __dirname + "/assets/images/items/" + fname
		});
		cb(null, fname);
	}
});

const uploadItemImages = multer({ storage: itemStorage });

app.post('/item/post_images', uploadItemImages.array("images"), (req, res) => {
	if(itemAwaitingFiles.beforeImages.length != 0){
		console.error("Error: item image lists must be empty at this point.");
		res.sendStatus(500);
	} else {
		let index = 0;
		for(let img of itemImagePaths){
			if(index++ < itemAwaitingFiles.beforeLength)
				itemAwaitingFiles.beforeImages.push(img.filename);
			else
				itemAwaitingFiles.afterImages.push(img.filename);
		}

		let filePath = __dirname + ASSETS_JSON + "items.json";
		fs.readFile(filePath, (err, data) => {
			if(err){
				console.error(err);
				res.sendStatus(500);
			} else {
				data = JSON.parse(data);
				let submission = {
					itemInfo: itemAwaitingFiles.itemInfo,
					beforeImages: itemAwaitingFiles.beforeImages,
					afterImages: itemAwaitingFiles.afterImages
				};
				
				if(itemAwaitingFiles.indexAt != -1)
					data.items[itemAwaitingFiles.itemCategoryKey + '']
						= new Algorithm.InsertAlgorithm(data.items[itemAwaitingFiles.itemCategoryKey + ''])
						.getProduct(itemAwaitingFiles.indexAt, {
							itemInfo: itemAwaitingFiles.itemInfo,
							beforeImages: itemAwaitingFiles.beforeImages,
							afterImages: itemAwaitingFiles.afterImages
						});
				else if(itemAwaitingFiles.selectIndex == undefined)
					data.items[itemAwaitingFiles.itemCategoryKey + ''].push(submission);
				else
					data.items[itemAwaitingFiles.itemCategoryKey + ''][itemAwaitingFiles.selectIndex] = submission;

				/*
				fs.writeFile(filePath, JSON.stringify(data, null, '\t'), err => {
					itemAwaitingFiles = null;
					itemImageFiles = [];

					if(err){
						console.error(err);
						res.sendStatus(500);
					} else
						res.sendStatus(200);
				});
				*/
				
				IOProcessor.write(1, JSON.stringify(data, null, '\t'), err => {
					itemAwaitingFiles = null;
					itemImageFiles = [];

					if(err){
						console.error(err);
						res.sendStatus(500);
					} else
						res.sendStatus(200);
				});
			}
		});
	}
});

var itemCategoryKey = 0;
app.get('/item/category_length/:itemCategoryKey', bodyParser.json(), (req, res) => {
	fs.readFile(__dirname + ASSETS_JSON + "items.json", (err, data) => {
		if(err){
			console.error(err);
			res.status(500).json({});
		} else {
			items = JSON.parse(data).items;
			itemCategoryKey = req.params.itemCategoryKey
			res.status(200).json({ itemLength: (items[itemCategoryKey] ? items[itemCategoryKey + ''].length : 0) });
		}
	});
});

app.get('/item/thumbnail/:itemCategoryKey/:itemIndex', (req, res) => {
	fs.readFile(__dirname + ASSETS_JSON + "items.json", (err, data) => {
		if(err){
			console.error(err);
			res.sendStatus(500);
		} else
			res.status(200).sendFile(__dirname + "/assets/images/items/" + JSON.parse(data)
				.items[req.params.itemCategoryKey + ''][req.params.itemIndex].afterImages[0]);
	});
});

app.get('/item/itemCategoryKeys', bodyParser.json(), (req, res) => {
	fs.readFile(__dirname + ASSETS_JSON + "item_categories.json", (err, data) => {
		if(err){
			console.error(err);
			res.status(500).json({});
		} else {
			data = JSON.parse(data);
			res.status(200).json({ itemCategoryKeys: data.itemCategoryKeys });
		}
	});
});

app.get('/item/image_lengths/:itemCategoryKey/:itemIndex', bodyParser.json(), (req, res) => {
	fs.readFile(__dirname + ASSETS_JSON + "items.json", (err, data) => {
		if(err){
			console.error(err);
			res.status(500).json({});
		} else {
			let item = JSON.parse(data).items[req.params.itemCategoryKey][req.params.itemIndex];
			res.status(200).json({
				beforeLength: item.beforeImages.length,
				afterLength: item.afterImages.length
			});
		}
	});
})

app.get('/item/beforeImage/:itemCategoryKey/:itemIndex/:imageIndex', (req, res) => {
	fs.readFile(__dirname + ASSETS_JSON + "items.json", (err, data) => {
		if(err){
			console.error(err);
			res.sendStatus(500);
		} else
			res.status(200).sendFile(__dirname + "/assets/images/items/" + JSON.parse(data).items
				[req.params.itemCategoryKey][req.params.itemIndex].beforeImages[req.params.imageIndex]);
	});
});

app.get('/item/afterImage/:itemCategoryKey/:itemIndex/:imageIndex', (req, res) => {
	fs.readFile(__dirname + ASSETS_JSON + "items.json", (err, data) => {
		if(err){
			console.error(err);
			res.sendStatus(500);
		} else
			res.status(200).sendFile(__dirname + "/assets/images/items/" + JSON.parse(data).items
				[req.params.itemCategoryKey][req.params.itemIndex].afterImages[req.params.imageIndex]);
	});
});

app.get('/item/info/:itemCategoryKey/:itemIndex', bodyParser.json(), (req, res) => {
	fs.readFile(__dirname + ASSETS_JSON + "items.json", (err, data) => {
		if(err){
			console.error(err);
			res.status(500).json({});
		} else
			res.status(200).json({ itemInfo: JSON.parse(data).items
				[req.params.itemCategoryKey][req.params.itemIndex].itemInfo });
	});
});

app.post('/item/delete', bodyParser.json(), (req, res) => {
	let filePath = __dirname + ASSETS_JSON + "items.json";
	fs.readFile(filePath, (err, data) => {
		if(err){
			console.error(err);
			res.status(500).json({});
		} else {
			data = JSON.parse(data);

			let beforeLength = data.items[req.body.itemCategoryKey + ''][req.body.indexAt].beforeImages.length,
				afterLength = data.items[req.body.itemCategoryKey + ''][req.body.indexAt].afterImages.length;
			let i = 0, j = 1;
			let deleteInterval = setInterval(() => {
				if(i != j){
					if(++i - 1 < beforeLength){
						fs.unlink(__dirname + IMAGES_ITEMS + data.items[req.body.itemCategoryKey + '']
						[req.body.indexAt].beforeImages[i - 1], err => {
							if(err){
								console.error("Error deleting before image.");
								console.error(err);
								clearInterval(deleteInterval);
								res.status(500).json({});
							}
							
							++j;
						});
					} else if(i - 1 >= beforeLength + afterLength){//finish
						clearInterval(deleteInterval);
						if(req.body.indexAt == data.items[req.body.itemCategoryKey + ''].length - 1)
							data.items[req.body.itemCategoryKey + ''].pop();
						else {
							data.items[req.body.itemCategoryKey + '']
							= new Algorithm.DeleteAlgorithm(data.items[req.body.itemCategoryKey + ''])
							.getProduct(req.body.indexAt);
						}
		
						/*
						fs.writeFile(filePath, JSON.stringify(data, null, '\t'), (err, data) => {
							if(err){
								console.error(err);
								res.status(500).json({});
							} else
								res.status(200).json({});
						});
						*/
						
						IOProcessor.write(1, JSON.stringify(data, null, '\t'), err => {
							if(err){
								console.error(err);
								res.status(500).json({});
							} else
								res.status(200).json({});
						});
					} else {
						fs.unlink(__dirname + IMAGES_ITEMS + data.items[req.body.itemCategoryKey + '']
						[req.body.indexAt].afterImages[i - beforeLength - 1], err => {
							if(err){
								console.error("Error deleting after image.");
								console.error(err);
								clearInterval(deleteInterval);
								res.sendStatus(500);
							}
							
							++j;
						});
					}
				}
			}, 50);
		}
	});
});

app.get('/currency_exchange_rate_usd', bodyParser.json(), (req, res) => {
	fs.readFile(process.env.CURRENCY_RATES_PATH, (err, data) => {
		if(err){
			console.error(err);
			res.status(500).json({});
		} else {
			data = JSON.parse(data);
			res.status(200).json({ usdRate: data.USD });
		}
	});
});

async function getUPSApproximation(rbody){
	const RECIPIENT = rbody.firstName + " " + rbody.lastName;
	
	//OLD STUFF
	const SHIPPER = {
		"Name": process.env.ORIGIN_NAME,
		"AttentionName": process.env.ORIGIN_BUSINESS_NAME,
		"TaxIdentificationNumber": "TaxID",
		"Phone": {
			"Number": "1234567890"
		},
		"ShipperNumber": process.env.ORIGIN_UPS_ACCOUNT_NUMBER,
		"Address": {
			"AddressLine": process.env.ORIGIN_ADDRESS,
			"City": process.env.ORIGIN_CITY,
			"StateProvinceCode": process.env.ORIGIN_STATE_CODE,
			"PostalCode": process.env.ORIGIN_POSTAL_CODE,
			"CountryCode": process.env.ORIGIN_COUNTRY_CODE
		}
	};
	const RECEIVER = {
		"Name": RECIPIENT,
		"AttentionName": "AttentionName",
		"Phone": {
			"Number": "1234567890"
		},
		"FaxNumber": "1234567999",
		"TaxIdentificationNumber": "456999",
		"Address": {
			"AddressLine": "197 Clearbrook Rd",
			"City": "Abbotsford",
			"StateProvinceCode": "BC",
			"PostalCode": "V2T5X1",
			"CountryCode": "CA"
		}
	};
	
	try {
		const response = await axios.post('https://onlinetools.ups.com/ship/v1/shipments?additionaladdressvalidation=city', {
			"ShipmentRequest": {
				"Shipment": {
					"Description": "Shipment with Rustic & Redefined",
					"Shipper": SHIPPER,
					"ShipTo": {
						"Name": RECIPIENT,
						"AttentionName": "AttentionName",
						"Phone": {
							"Number": "1234567890"
						},
						"FaxNumber": "1234567999",
						"TaxIdentificationNumber": "456999",
						"Address": {
							"AddressLine": rbody.location.address,
							"City": rbody.location.city,
							"StateProvinceCode": rbody.location.regionCode,
							"PostalCode": rbody.location.areaCode,
							"CountryCode": rbody.location.countryCode
						}
					},
					"ShipFrom": SHIPPER,
					"PaymentInformation": {
						"ShipmentCharge": {
							"Type": "01",
							"BillShipper": {
								"AccountNumber": process.env.ORIGIN_UPS_ACCOUNT_NUMBER
							}
						}
					},
					"Service": {
						"Code": rbody.location.countryCode == "CA" ? "01" : "65"
						//"Description": "Expedited"
					},
					"Package": [
						{
							"Description": "International Goods",
							"Packaging": {
								"Code": "02"
							},
							"Dimensions": {
								"UnitOfMeasurement": {
									"Code": "IN"
								},
								"Width": rbody.pckg.width,
								"Height": rbody.pckg.height,
								"Length": rbody.pckg.length
							},
							"PackageWeight": {
								"UnitOfMeasurement": {
									"Code": "LBS"
								},
								"Weight": rbody.pckg.weight
							},
							"PackageServiceOptions": ""
						}
					],
					"ItemizedChargesRequestedIndicator": "",
					"RatingMethodRequestedIndicator": "",
					"TaxInformationIndicator": "",
					"ShipmentRatingOptions": {
						"NegotiatedRatesIndicator": ""
					}
				},
				"LabelSpecification": {
					"LabelImageFormat": {
						"Code": "GIF"
					}
				}
			}
		}, {
			headers: {
				"AccessLicenseNumber": process.env.UPS_ACCESS_LICENSE_NUMBER,
				"Username": process.env.UPS_USERNAME,
				"Password": process.env.UPS_PASSWORD,
				"Content-Type": "application/json",
				"transId": "Transaction123",
				"transactionSrc": "GG",
				"Accept": "application/json"
			}
		});

		if(response.data.ShipmentResponse.Response.ResponseStatus.Code == "1"){
			let result = response.data.ShipmentResponse.ShipmentResults.ShipmentCharges.TotalCharges;
			console.log("Shipping: " + Number(result.MonetaryValue) + ", code: " + result.CurrencyCode);
			return {
				isUsd: result.CurrencyCode == "USD",
				price: Number(result.MonetaryValue),
				flag: 0
			};
		} else{
			console.log(response.data);
			return { flag: -1 };
		}
	} catch(error){
		console.error(error);
		return { flag: -1 };
	}
	
	/*
	let SHIPPER = {
		ConsigneeName: "Rustic and Redefined",
	};
	let RECEIVER = {
		ConsigneeName: RECIPIENT
	};
	let shippingInfo = {
		isUsd: false,
		price: 0,
		flag: 0
	};
	
	//256 Winnett Ave, York, ON M6C 3L9
	SHIPPER.AddressLine = [
		process.env.ORIGIN_ADDRESS,
		process.env.ORIGIN_ADDRESS,
		process.env.ORIGIN_ADDRESS
	];
	//SHIPPER.Region = `${process.env.ORIGIN_CITY},${process.env.STATE_CODE},${process.env.ORIGIN_POSTAL_CODE}`;
	SHIPPER.PoliticalDivision2 = process.env.ORIGIN_CITY;
	SHIPPER.PoliticalDivision1 = process.env.ORIGIN_STATE_CODE;
	SHIPPER.PostcodePrimaryLow = process.env.ORIGIN_POSTAL_CODE;
	SHIPPER.CountryCode = "CA";
	*/
	
	/*
	if(rbody.location.countryCode == "CA"){
		SHIPPER.AddressLine = [
			process.env.ORIGIN_ADDRESS,
			process.env.ORIGIN_ADDRESS,
			process.env.ORIGIN_ADDRESS
		];
		//SHIPPER.Region = `${process.env.ORIGIN_CITY},${process.env.STATE_CODE},${process.env.ORIGIN_POSTAL_CODE}`;
		SHIPPER.PoliticalDivision2 = process.env.ORIGIN_CITY;
		SHIPPER.PoliticalDivision1 = process.env.ORIGIN_STATE_CODE;
		SHIPPER.PostcodePrimaryLow = process.env.ORIGIN_POSTAL_CODE;
		SHIPPER.CountryCode = "CA";
		RECEIVER.CountryCode = "CA";
	}
	//else {
	//	SHIPPER.AddressLine = [process.env.ORIGIN_ADDRESS_US];
	//	SHIPPER.PoliticalDivision2 = process.env.ORIGIN_CITY_US;
	//	SHIPPER.PoliticalDivision1 = process.env.ORIGIN_STATE_CODE_US;
	//	SHIPPER.PostcodePrimaryLow = process.env.ORIGIN_POSTAL_CODE_US;
	//	SHIPPER.CountryCode = "US";
	//	RECEIVER.CountryCode = "US";
	//}
	else {
		SHIPPER.AddressLine = [
			'26601 ALISO CREEK ROAD',
			'26601 ALISO CREEK ROAD',
			'26601 ALISO CREEK ROAD'
		];
		SHIPPER.PoliticalDivision2 = 'ALISO VIEJO';
		SHIPPER.PoliticalDivision1 = 'CA';
		SHIPPER.PostcodePrimaryLow = '92656';
		SHIPPER.CountryCode = 'US';
		RECEIVER.CountryCode = "US";
		shippingInfo.isUsd = true;
	}
	*/
	
	/*
	RECEIVER.AddressLine = [rbody.location.address];
	RECEIVER.PoliticalDivision2 = rbody.location.city;
	RECEIVER.PoliticalDivision1 = rbody.location.regionCode;
	RECEIVER.PostcodePrimaryLow = rbody.location.areaCode;
	RECEIVER.CountryCode = rbody.location.countryCode;
	
	const formData = {
		grant_type: 'client_credentials'
	};

	const authCodeResp = await fetch(
		`https://wwwcie.ups.com/security/v1/oauth/token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'x-merchant-id': 'string',
			Authorization: 'Basic ' + btoa('rphGPQ1QaqNp8s6DFg3UowI2jFCeI30aDm7CO5SGA6zbCuvG:KN6VhlAx9g223L9XTCyHibG1dv4TPRDAJKu6RXN32TtxRBfj6nTjcgyIBxLRWAwA')
		},
		body: new URLSearchParams(formData).toString()
	  }
	);
	const token = await authCodeResp.json();
	
	//console.log("Shipper");
	//console.log(SHIPPER);
	//console.log("Receiver");
	//console.log(RECEIVER);
	
	const shippingInfoResp = await fetch(
		`https://wwwcie.ups.com/api/rating/v2205/Rate`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				//transId: 'string',
				transactionSrc: 'testing',
				Authorization: 'Bearer ' + token.access_token
			},
			body: JSON.stringify({
				RateRequest: {
				Request: {
					TransactionReference: {
						CustomerContext: 'CustomerContext'
					}
				},
				Shipment: {
					Shipper: {
					Name: 'Dave De Jong',
					ShipperNumber: 'B77E38',
					Address: {
						AddressLine: [
							//SHIPPER.AddressLine[0],
							//SHIPPER.AddressLine[1],
							//SHIPPER.AddressLine[2]
							process.env.ORIGIN_ADDRESS,
							process.env.ORIGIN_ADDRESS,
							process.env.ORIGIN_ADDRESS
						],
						//City: SHIPPER.PoliticalDivision2,
						//StateProvinceCode: SHIPPER.PoliticalDivision1,
						//PostalCode: SHIPPER.PostcodePrimaryLow,
						//CountryCode: SHIPPER.CountryCode
						City: process.env.ORIGIN_CITY,
						StateProvinceCode: process.env.ORIGIN_STATE_CODE,
						PostalCode: process.env.ORIGIN_POSTAL_CODE,
						CountryCode: process.env.ORIGIN_COUNTRY_CODE
					}
				},
				  ShipTo: {
					Name: RECIPIENT,
					Address: {
					  AddressLine: [
						RECEIVER.AddressLine[0],
						RECEIVER.AddressLine[1],
						RECEIVER.AddressLine[2]
					  ],
					  City: RECEIVER.PoliticalDivision2,
					  StateProvinceCode: RECEIVER.PoliticalDivision1,
					  PostalCode: RECEIVER.PostcodePrimaryLow,
					  CountryCode: RECEIVER.CountryCode
					}
				  },
				  ShipFrom: {
					Name: 'ShipFromName',
					Address: {
					  AddressLine: [
						//'ShipFromAddressLine',
						//'ShipFromAddressLine',
						//'ShipFromAddressLine'
						process.env.ORIGIN_ADDRESS,
						process.env.ORIGIN_ADDRESS,
						process.env.ORIGIN_ADDRESS
					  ],
						//City: SHIPPER.PoliticalDivision2,
						//StateProvinceCode: SHIPPER.PoliticalDivision1,
						//PostalCode: SHIPPER.PostcodePrimaryLow,
						//CountryCode: SHIPPER.CountryCode
						City: process.env.ORIGIN_CITY,
						StateProvinceCode: process.env.ORIGIN_STATE_CODE,
						PostalCode: process.env.ORIGIN_POSTAL_CODE,
						CountryCode: process.env.ORIGIN_COUNTRY_CODE
					}
				  },
				  PaymentDetails: {
					ShipmentCharge: {
					  Type: '01',
					  BillShipper: {
						AccountNumber: 'B77E38'
					  }
					}
				  },
				  Service: {
					Code: '03',
					Description: 'Ground'
				  },
				  NumOfPieces: '1',
				  Package: {
					//SimpleRate: {
					//  Description: 'SimpleRateDescription',
					//  Code: 'XS'
					//},
					PackagingType: {
					  Code: '02',
					  Description: 'Packaging'
					},
					Dimensions: {
					  UnitOfMeasurement: {
						Code: 'IN',
						Description: 'Inches'
					  },
					  Length: '5',
					  Width: '5',
					  Height: '5'
					},
					PackageWeight: {
					  UnitOfMeasurement: {
						Code: 'LBS',
						Description: 'Pounds'
					  },
					  Weight: '1'
					}
				  }
				}
				}
			})
		}
	);

	const shippingInfoData = await shippingInfoResp.json();
	console.log(shippingInfoData.response.errors);
	*/
	
	return shippingInfo;
}

class HTMLTableRow {
	constructor(){
		this.cols = [];
	}

	addCol(text){
		this.cols.push(text);
	}
}

class HTMLTable {
	constructor(style){
		this.opener = `<table style='${style}'>`;
		this.close = "</table>";
		this.rows = [];
	}

	addRow(){
		this.rows.push(new HTMLTableRow());
	}

	addCol(text=""){
		this.rows[this.rows.length - 1].addCol(text);
	}

	toString(){
		let table = this.opener;
		for(let row of this.rows){
			table += "<tr>";
			for(let col of row.cols)
				table += `<td>${col}</td>`;
			table += "</tr>";
		}
		return table + "</table>";
	}
}

const authenticationTransactions = {};
async function createDoc(authenticationTransactionKey, cardholder, street, city, areaCode, country, email, phoneNumber, productName,
	productSubtotal, shippingFee, total, currency, isPickup, priceMod, unitNumber=undefined){
	const doc = new PdfKit();
	const absPath = path.join(__dirname, `assets/invoices/Invoice_Rustic-${Date.now()}.pdf`);
	doc.pipe(fs.createWriteStream(absPath));

	doc.image('assets/images/cover/logo_invoice.png', doc.page.width - 300, 50, { width: 200 });
	doc.font('Helvetica-Bold')
	.fontSize(26)
	.text('INVOICE', 50, 65);

	doc.fontSize(18)
	.text('Rustic & Redefined', 50, 100);

	doc.font('Helvetica')
	.fontSize(12)
	.text(process.env.CONTACT_EMAIL, 50, 145);
	doc.text('www.rusticredefined.ca', 50, 162);

	doc.text(cardholder, 50, 192);
	if(street)
		doc.text(street + (unitNumber ? ", " + unitNumber : ''), 50, 209);
	if(city)
		doc.text(city + ', ' + areaCode, 50, 226);
	if(country)
		doc.text(country, 50, 243);
	doc.text(email, 50, 260);
	doc.text(phoneNumber, 50, 277);

	let rightMargin = doc.page.width - 50;

	doc.font('Helvetica-Bold')
	.text('DESCRIPTION', 50, 310);
	doc.moveTo(50, 323).lineTo(rightMargin, 323).stroke();
	doc.font('Helvetica')
	.text('Subtotal', 50, 327);
	doc.moveTo(50, 340).lineTo(rightMargin, 340).stroke();
	doc.text('Transportation Fee' + (isPickup ? ' (Pick Up)' : ''), 50, 344);
	doc.moveTo(50, 357).lineTo(rightMargin, 357).stroke();
	doc.font('Helvetica-Bold')
	.text('Total', 50, 361);

	doc.font('Helvetica')
	.moveTo(doc.page.width, 310)
	.moveUp(4.75)
	.text(productName, { align: 'right' });
	doc.moveTo(doc.page.width, 327)
	.moveDown(0.375)
	.text(`$${productSubtotal}`, { align: 'right' });
	doc.moveTo(doc.page.width, 344)
	.moveDown(0.2)
	.text(`$${!isPickup ? shippingFee : 0}`, { align: 'right' });
	doc.moveTo(doc.page.width, 361)
	.moveDown(0.2)
	.text(`$${total} ${currency}`, { align: 'right' });

	doc.font('Helvetica')
	.moveTo(doc.page.width / 2, 500)
	.moveDown()
	.moveDown()
	.text('Thank you for your business! Our shipments generally arrive in under three weeks. For any questions'
		+ ' please email us at ' + process.env.CONTACT_EMAIL + '.', { align: 'center' });
		
	doc.end();
	return absPath;
}

app.post('/transaction/purchase/begin_authentication', bodyParser.json(), async (req, res) => {
	fs.readFile(__dirname + ASSETS_JSON + "items.json", async (err, data) => {
		if(err){
			console.error(err);
			res.status(500).json({});
		} else {
			let item = JSON.parse(data).items[req.body.itemCategoryKey][req.body.itemIndex];
			let shippingInfo;
			if(!req.body.transportationMethodPickup){
				req.body.pckg = {
					width: item.itemInfo.width + "",
					height: item.itemInfo.height + "",
					length: item.itemInfo.length + "",
					weight: item.itemInfo.weight + ""
				};
				shippingInfo = await getUPSApproximation(req.body);
				
				if(shippingInfo.flag == -1)
					res.status(500).json({ msg: "UPS shipping request failure" });
				else {
					//TODO test whether the shipping currency will be USD if the client is from USA
					if(shippingInfo.isUsd && req.body.priceMod == 1){
						try{
							let ratesCAD = await fs.readFile(process.env.CURRENCY_RATES_PATH);
							shippingInfo.price *= (1 / ratesCAD.USD);
						} catch(error){
							console.error(error);
							res.status(500).json({ msg: "Failure attaining currency rates" });
						}
					} else if(!shippingInfo.isUsd && req.body.priceMod != 1)
						shippingInfo.price *= req.body.priceMod;
				}
			} else
				shippingInfo = { flag: 0 };

			if(shippingInfo.flag != -1){
				let enterTwoCols = (table, key, val) => {
					table.addRow();
					table.addCol(key);
					table.addCol(val);
				};
	
				let currencyCode = ' ' + (req.body.priceMod != 1 ? "USD" : "CAD");
				let subtotal = Number(item.itemInfo.price) * req.body.priceMod;
				let total = (subtotal + (shippingInfo.price ? shippingInfo.price : 0)).toFixed(2);
				let totalStr = total + " " + currencyCode;
				let infoTable = new HTMLTable("border: solid black 1pt");
	
				//address info
				let reqCountry;
				let reqAreaCode = '';
				for(let c = 0; c < req.body.location.areaCode.length; c++){
					if(req.body.location.areaCode[c] != ' ')
						reqAreaCode += req.body.location.areaCode[c];
				}
				
				if(!req.body.transportationMethodPickup){
					enterTwoCols(infoTable, "Address", req.body.location.address
						+ (req.body.location.unitNumber ? `, Unit #${req.body.location.unitNumber}` : ''));
					enterTwoCols(infoTable, "Area Code", reqAreaCode);
					enterTwoCols(infoTable, "City/Region", req.body.location.city + " " + req.body.location.regionCode);
					reqCountry = req.body.location.countryCode == "CA" ? "Canada" : "United States";
					enterTwoCols(infoTable, "Country", reqCountry);
					infoTable.addRow();
					
					enterTwoCols(infoTable, "Subtotal", subtotal);
					enterTwoCols(infoTable, "Shipping", shippingInfo.price + '');
				}
				enterTwoCols(infoTable, "Total", totalStr);

				let authenticationTransactionKey = `${Date.now()}-${Date.now() * (Math.floor(Math.random() * 200) + 1)}`;
				let authTransaction = {
					name: item.itemInfo.name,
					about: item.itemInfo.about,
					shippingCost: shippingInfo.price,
					subtotal: subtotal.toFixed(2),
					total: total,
					email: req.body.email,
					pdfUrl: '',
					fireoff: ''
				};
				authenticationTransactions[authenticationTransactionKey] = authTransaction;

				let stripeLink = '<div style="background-color: #fdeed5; border-radius: 5pt; display: inline-block">'
				+ '<img src="cid:' + item.afterImages[0] + '" style="height: 75pt; border: solid black 2pt; border-'
				+ 'radius: 5pt 5pt 0 0; box-shadow: 2px 4px 8px #888888" /><h3 style="margin-left: 6pt">'
				+ item.itemInfo.name + '</h3><h4 style="margin-left: 6pt">$' + totalStr
				+ `</h4><a href="${process.env.PORT_SERVER}/transaction/purchase/${authenticationTransactionKey}">`
				+ '<button style="background-color: rgb(91, 6, 22); color: white; font-weight: 600; border-radius'
				+ ': 0 0 5pt 5pt; width: 100%">Continue to Checkout</button></a></div>';

				if(req.body.transportationMethodPickup)
					authenticationTransactions[authenticationTransactionKey].pdfUrl = await createDoc(authenticationTransactionKey,
						req.body.firstName + ' ' + req.body.lastName, undefined, undefined, undefined, undefined,
						req.body.email, req.body.phoneNumber, authTransaction.name, subtotal.toFixed(2),
						shippingInfo.price, total, req.body.priceMod != 1 ? "USD" : "CAD",
						req.body.transportationMethodPickup, req.body.priceMod, undefined);
				else
					authenticationTransactions[authenticationTransactionKey].pdfUrl = await createDoc(authenticationTransactionKey,
						req.body.firstName + ' ' + req.body.lastName, req.body.location.address, req.body.location.city,
						reqAreaCode, reqCountry, req.body.email, req.body.phoneNumber, authTransaction.name,
						subtotal.toFixed(2), shippingInfo.price, total, req.body.priceMod != 1 ? "USD" : "CAD",
						req.body.transportationMethodPickup, req.body.priceMod, req.body.location.unitNumber);
	
				let emailRundown = infoTable.toString() + stripeLink;
				transporter.sendMail({
					from: process.env.NEWSLETTER_EMAIL,
					to: req.body.email,
					subject: "Please authenticate your contact information",
					attachments: [storageAttachments[0], {
						path: __dirname + IMAGES_ITEMS + '/' + item.afterImages[0],
						cid: item.afterImages[0]
					}],
					html: getHeaderImageTag() + emailRundown
				}, (err, info) => {
					if(err){
						console.error(err);
						res.status(500).json({});
					} else
						res.status(200).json({ authenticationTransactionKey: authenticationTransactionKey });
				});
			}
		}
	});
});

app.get('/transaction/purchase/:authenticationUser', async (req, res) => {
	if(!authenticationTransactions[req.params.authenticationUser]){
		console.error("An error occurred trying to identify the authentication transaction key.");
		res.sendStatus(500);
	} else {
		//process payment
		let item = authenticationTransactions[req.params.authenticationUser];
		const product = await stripe.products.create({'name': item.name, 'description': item.about});
		const price = await stripe.prices.create({
			product: product.id,
			unit_amount: item.total * 100,
			currency: 'cad',
		});
		
		let fireoff = '';
		let alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
		for(let i = 0; i < 10; i++)
			fireoff += alphabet[Math.floor(Math.random() * alphabet.length)];
		authenticationTransactions[req.params.authenticationUser].fireoff = fireoff;
		
		const SUCCESS_URL = `${process.env.PORT_CLIENT}/payment_success?transaction_key=${req.params.authenticationUser}`
			+ `&fireoff=${fireoff}`;
			
		/*
		const session = await stripe.checkout.sessions.create({
			line_items: [
				{
					price: price.id,
					quantity: 1,
				},
			],
			mode: 'payment',
			success_url: SUCCESS_URL,
			cancel_url: `${process.env.PORT_CLIENT}/shop`
		});
		*/

		//res.redirect(303, session.url);
		res.redirect(303, SUCCESS_URL);
	}
});

app.get('/email_invoice/:authenticationTransactionKey/:fireoff', bodyParser.json(), (req, res) => {
	let trans = authenticationTransactions[req.params.authenticationTransactionKey];
	if(trans && trans.fireoff == req.params.fireoff){
		transporter.sendMail({
			from: process.env.NEWSLETTER_EMAIL,
			to: trans.email,
			//cc: 'intiva.technologies@gmail.com,xxmsinclair66xx@gmail.com',
			subject: "Thank you for your purchase!",
			attachments: [
				storageAttachments[0], {
					path: authenticationTransactions[req.params.authenticationTransactionKey].pdfUrl,
					filename: `Invoice-Rustic.pdf`
				}
			],
			html: getHeaderImageTag() + "Attached is a record of your invoice."
		}, (err, info) => {
			if(err){
				console.error(err);
				res.status(500).json({});
			} else
				res.status(200).json({ authenticationTransactionKey: authenticationTransactionKey });
		});
	} else {
		console.error("An error occurred trying to identify the authentication transaction key.");
		res.sendStatus(500);
	}
});

app.post('/marketplace/add_partner', bodyParser.json(), (req, res) => {
	let filename = __dirname + ASSETS_JSON + "marketplace_partners.json";
	fs.readFile(filename, (err, data) => {
		if(err){
			console.error(err);
			res.status(500).json({});
		} else {
			data = JSON.parse(data);
			data.marketplace.names.push(req.body.name);
			data.marketplace.links.push(req.body.link);
			
			/*
			fs.writeFile(filename, JSON.stringify(data, null, '\t'), (err, data) => {
				if(err){
					console.error(err);
					res.status(500).json({});
				} else
					res.status(200).json({});
			});
			*/
			
			IOProcessor.write(2, JSON.stringify(data, null, '\t'), err => {
				if(err){
					console.error(err);
					res.status(500).json({});
				} else
					res.status(200).json({});
			});
		}
	});
});

app.post('/marketplace/delete_partner', bodyParser.json(), (req, res) => {
	let filename = __dirname + ASSETS_JSON + "marketplace_partners.json";
	fs.readFile(filename, (err, data) => {
		if(err){
			console.error(err);
			res.status(500).json({});
		} else {
			data = JSON.parse(data);
			data.marketplace.names = new Algorithm.DeleteAlgorithm(data.marketplace.names).getProduct(req.body.index);
			data.marketplace.links = new Algorithm.DeleteAlgorithm(data.marketplace.links).getProduct(req.body.index);

/*
			fs.writeFile(filename, JSON.stringify(data, null, '\t'), (err, data) => {
				if(err){
					console.error(err);
					res.status(500).json({});
				} else
					res.status(200).json({});
			});
			*/
			
			IOProcessor.write(2, JSON.stringify(data, null, '\t'), err => {
				if(err){
					console.error(err);
					res.status(500).json({});
				} else
					res.status(200).json({});
			});
		}
	});
});

app.get('/marketplace/get_partners', bodyParser.json(), (req, res) => {
	let filename = __dirname + ASSETS_JSON + "marketplace_partners.json";
	fs.readFile(filename, (err, data) => {
		if(err){
			console.error(err);
			res.status(500).json({});
		} else
			res.status(200).json(JSON.parse(data));
	});
});

app.get('/test_message', bodyParser.json(), (req, res) => {
	console.log("Message requested.");
	res.status(200).json({ msg: 'Hello, world!' });
});

async function _runatestrun(){
	const files = {
		"item_categories": {
			"itemCategories": ["Projects"],
			"itemCategoryKeys": [0]
		}, "items": {
			"items": {}
		}, "newsletter_subscriber_list": {
			"subscribers": [
				{
					"email": "michaelkevin.sinclair@gmail.com",
					"verified": true
				}
			]
		}, "marketplace_partners": {
			"marketplace": {
				"names": [],
				"links": []
			}
		}
	};
	
	const file_keys = [
		"item_categories",
		"items",
		"newsletter_subscriber_list",
		"marketplace_partners"
	];
	
	const writeJson = (fileIndex, data) => {
		return new Promise((resolve, reject) => {
			/*
			fs.writeFile(`./assets/json/${filename}.json`, JSON.stringify(data, null, '\t'), (err, data) => {
				if(err){
					console.error(err);
					reject(false);
				} else
					res(true);
			});
			*/
			
			IOProcessor.write(fileIndex, JSON.stringify(data, null, '\t'), err => {
				if(err){
					console.error(err);
					reject(false);
				} else
					resolve(true);
			});
		});
	};
	
	try {
		const results = await Promise.all(
		  file_keys.map(key => writeJson(key, files[key]))
		);
		return true;
	} catch (err) {
		return false;
	}
}

async function executeTestRun(){
	if(_runatestrun())
		console.log("✅ All json caches fully emptied.");
	else
		console.error("❌ At least one json caches failed to empty.");
}

const server = http.createServer(/*{
	cert: fs.readFileSync('bundle.crt'),
	key: fs.readFileSync('server.key'),
}, */app);
server.listen(PORT, () => {
	//executeTestRun();
	
	console.log(`App listening on ${PORT}`);
});