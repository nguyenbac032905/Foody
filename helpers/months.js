module.exports.months = ({count}) => {
  const months = [];
  const now = new Date();
  for(let i = count-1; i >= 0; i--){
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getMonth()+1}/${d.getFullYear()}`);
  }
  return months;
}