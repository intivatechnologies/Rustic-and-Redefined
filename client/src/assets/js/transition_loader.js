var transition_loader = {
    loadElement(el){
        el.className = el.className.replace("transition", "default-transition");
    }
};

export default transition_loader;