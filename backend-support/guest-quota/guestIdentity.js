const crypto = require('node:crypto');
function guestUserId(platform, deviceId, secret) {
  if(typeof secret!=='string'||secret.length<32)throw Object.assign(new Error('Guest access is not configured.'),{code:'GUEST_UNAVAILABLE'});
  if(platform!=='android'||typeof deviceId!=='string'||!/^[a-f0-9]{16}$/i.test(deviceId))throw Object.assign(new Error('Guest device is unavailable.'),{code:'GUEST_DEVICE_INVALID'});
  return 'guest_'+crypto.createHmac('sha256',secret).update('hindpdf:android:'+deviceId.toLowerCase()).digest('hex');
}
module.exports={guestUserId};
