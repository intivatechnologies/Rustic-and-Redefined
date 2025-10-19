class Algorithm {
    constructor(list){
        this.list = list;
    }

    getProduct(){
        return this.list;
    }
}

class DeleteAlgorithm extends Algorithm {
    getProduct(index){
        let product = this.list;
        let i = index;
		for(let i = index; i < product.length - 1; i++)
            product[i] = product[i + 1];
		product.pop();
        return product;
    }
}

class InsertAlgorithm extends Algorithm {
    getProduct(index, element){
        let product = this.list;
        product.push(undefined);

        for(let i = product.length - 1; i > index; i--)
            product[i] = product[i - 1];
        product[index] = element;
        return product;
    }
}

module.exports = {
    DeleteAlgorithm: DeleteAlgorithm,
    InsertAlgorithm: InsertAlgorithm
};