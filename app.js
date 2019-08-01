const request = require('request');
const S3 = require('./database');
const s3 = new S3();
const endpoint = 'https://api.coinbase.com/v2/prices/spot?currency=USD';
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3837.0 Safari/537.36 Edg/77.0.211.3';
const s3Bucket = process.env.S3_BUCKET;

const restaurants = [
  '中區',
  '西區',
  '香港仔',
  '北角',
  '跑馬地',
  '東九龍行動',
  '觀塘',
  '黃大仙',
  '牛頭角',
  '旺角',
  '油麻地',
  '深水埗',
  '長沙灣',
  '九龍城',
  '紅磡',
  '西九龍機動行動',
  '尖沙咀',
  '新界南總',
  '荃灣',
  '葵涌'
];

exports.handler = async (event) => {
  return makeRequest(endpoint, userAgent)
    .then(response => {
      let result = JSON.parse(response)
      let price = Math.round(result.data.amount);
      let weightedResult = price % restaurants.length;
      let date = new Date();
      let outputJson = {
        restaurants: restaurants,
        rawResult: result,
        weightedResult: weightedResult,
        restaurant: restaurants[weightedResult],
        lastUpdate: date.yyyymmdd() + ' 18:00'
      };
      console.log(JSON.stringify(outputJson));
      return putS3Data('result.json', JSON.stringify(outputJson), 'application/json', s3Bucket, 'public-read');
    });
};

function makeRequest(url, userAgent) {
  return new Promise((resolve, reject) => {
    let options = {
      url: url,
      headers: {
        'User-Agent': userAgent
      }
    };
    request(options, (err, response, body) => {
      if (err) {
        return reject(err);
      }
      return resolve(body);
    });
  });
}

function putS3Data(key, value, contentType, s3Bucket, acl) {
  let s3Params = {
    Bucket: s3Bucket,
    Key: key,
    Body: value,
    ContentType: contentType,
    ACL: acl,
    StorageClass: 'STANDARD'
  };
  return s3.putObject(s3Params)
    .then(result => result, err => {
      throw err;
    });
}

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('-');
};

Date.prototype.hhmmss = function() {
  var hh = this.getHours() + 8;
  var mm = this.getMinutes();
  var ss = this.getSeconds();
  return [hh, mm, ss].join(':');
}
