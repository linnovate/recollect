
const cloneObj = obj => JSON.parse(JSON.stringify(obj));
const urlValidation = url => { 
  console.log('validating url: ', url);
  const res = /^(ftp|http|https):\/\/[^ "]+$/.test(url);
  console.log('result: ', res);
  return res;
}

module.exports = {
  cloneObj,
  urlValidation,
};
