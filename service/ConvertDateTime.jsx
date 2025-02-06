import moment from "moment"

export const FormatDate=(timestamp)=>{
    return new Date(timestamp).setHours(0,0,0,0)
}

export const FormatDateForText=(date)=>{
   return moment(date).format('ll')
}

export const FormatTime=(timestamp)=>{
    const date= new Date(timestamp);
    const timeString=date.toLocaleTimeString([],{
        hour: '2-digit',
        minute: '2-digit'
    })
    console.log(timeString)
    return timeString;//9.00 AM like that
}
 export const getDatesRange=(startdate,endDate)=>{
    const start=moment(new Date(startdate),'MM/DD/YYYY')
    const end=moment(new Date(endDate),'MM/DD/YYYY')
    const dates=[]
    
    while(start.isSameOrBefore(end)){
        dates.push(start.format('MM/DD/YYYY'));
        start.add(1,'days')
    }
    return dates
 }
 
 export const GetDatesRangeToDisplay=() =>{
    const dateList=[];
    for(let i=0; i<7;i++){
        dateList.push({
            date:moment().add(i,'days').format('DD'),//27
            day:moment().add(i,'days').format('dd'),//tue
            formattedDate:moment().add(i,'days').format('L'),//01/27/2025
        })
    }
    return dateList;
 }
 export const GetPrevDatesRangeToDisplay = () => {
    const dates = [];
    for (let i = 0; i <= 7; i++) { // Loop through the past 7 days
        const date = moment().subtract(i, 'days');
        dates.push({
            date: date.format('D'), // Day of the month (e.g., 27)
            day: date.format('dd'), // Abbreviated day name (e.g., Tue)
            formattedDate: date.format('L'), // Full date (e.g., 01/27/2025)
        });
    }
    return dates; // Return the `dates` array
};