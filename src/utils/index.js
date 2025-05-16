const toThousand = n => {
    const num = Number(n);
    if (isNaN(num)) return n;
    const fixed = num.toFixed(2);
    const [entero, decimal] = fixed.split(".");
    return entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + decimal;
};

const paginator = (items = [], page = 1, perPage = 10,) => {

    const start = (+page - 1) * perPage;
    const end = start + perPage;

    return {
        items : items.slice(start, end),
        total : Math.ceil(items.length / perPage)
    }
}


module.exports =  {
    toThousand,
    paginator
}