/* إعداد وقت التشغيل — عدّل API_BASE بعد نشر الـBackend ثم فعّل الربط.
   يبقى الوضع المحلي (localStorage) عاملاً حتى تُحدّد عنواناً صحيحاً. */
(function(){
  var API_BASE = ""; // مثال: "https://smartcode-api.onrender.com"
  try{
    if(API_BASE){
      localStorage.setItem('sc_api_base', API_BASE);
      localStorage.setItem('sc_use_backend','1'); // فعّل الربط بالـAPI
    }
  }catch(e){}
})();
