module.exports = {
    dateWithMonth: (IsoDate) => {
        console.log(IsoDate);
        let NameMonth = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
        let year = IsoDate.getFullYear();
        let month = NameMonth[IsoDate.getMonth()]
        let dt = IsoDate.getDate();
        let Now = dt + " " + month + " "+ year
        return Now

    }


}