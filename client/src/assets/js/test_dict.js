function test(dict){
    let log = "{\n";
    for(const [key] of Object.entries(dict))
        log += `${key}: ${dict[key] + (Array.isArray(dict[key]) ? " (Array)" : "")}\n`;
    log += "}";
    console.log(log);
}

export default test;