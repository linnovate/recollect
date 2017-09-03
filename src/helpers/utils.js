
const cloneObj = obj => JSON.parse(JSON.stringify(obj));
const urlValidation = url => /^(ftp|http|https):\/\/[^ "]+$/.test(url);

module.exports = {
  cloneObj,
  urlValidation,
};
