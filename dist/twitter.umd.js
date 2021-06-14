!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t():"function"==typeof define&&define.amd?define(t):t()}(0,function(){var e=require("crypto"),t=require("oauth-1.0a"),r=require("cross-fetch"),n=require("querystring"),s=require("./stream"),o=function(e,t){return void 0===t&&(t="1.1"),"https://"+e+".twitter.com/"+t},i={subdomain:"api",consumer_key:null,consumer_secret:null,access_token_key:null,access_token_secret:null,bearer_token:null,version:"1.1",extension:!0},a=["direct_messages/events/new","direct_messages/welcome_messages/new","direct_messages/welcome_messages/rules/new","media/metadata/create","collections/entries/curate"],u={"Content-Type":"application/json",Accept:"application/json"};function c(e){return e.replace(/!/g,"%21").replace(/\*/g,"%2A").replace(/'/g,"%27").replace(/\(/g,"%28").replace(/\)/g,"%29")}var h=function(r){var n,s=Object.assign({},i,r);this.authType=s.bearer_token?"App":"User",this.client=t({consumer:{key:(n={key:s.consumer_key,secret:s.consumer_secret}).key,secret:n.secret},signature_method:"HMAC-SHA1",hash_function:function(t,r){return e.createHmac("sha1",r).update(t).digest("base64")}}),this.token={key:s.access_token_key,secret:s.access_token_secret},this.url=o(s.subdomain,s.version),this.oauth=o(s.subdomain,"oauth"),this.config=s};h._handleResponse=function(e){try{var t=e.headers;return e.ok?204===e.status||"0"===e.headers.get("content-length")?Promise.resolve({_headers:t}):Promise.resolve(e.json().then(function(e){return e._headers=t,e})):Promise.resolve(e.json()).then(function(e){throw Object.assign({},{_headers:t},e)})}catch(e){return Promise.reject(e)}},h._handleResponseTextOrJson=function(e){try{return Promise.resolve(e.text()).then(function(t){if(e.ok)return n.parse(t);var r;try{r=JSON.parse(t)}catch(e){r=t}return Promise.reject(r)})}catch(e){return Promise.reject(e)}},h.prototype.getBearerToken=function(){try{var e={Authorization:"Basic "+Buffer.from(this.config.consumer_key+":"+this.config.consumer_secret).toString("base64"),"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"};return Promise.resolve(r("https://api.twitter.com/oauth2/token",{method:"POST",body:"grant_type=client_credentials",headers:e}).then(h._handleResponse))}catch(e){return Promise.reject(e)}},h.prototype.getRequestToken=function(e){try{var t={url:this.oauth+"/request_token",method:"POST"},s={};e&&(s={oauth_callback:e}),s&&(t.url+="?"+n.stringify(s));var o=this.client.toHeader(this.client.authorize(t,{}));return Promise.resolve(r(t.url,{method:"POST",headers:Object.assign({},u,o)}).then(h._handleResponseTextOrJson))}catch(e){return Promise.reject(e)}},h.prototype.getAccessToken=function(e){try{var t={url:this.oauth+"/access_token",method:"POST"},s={oauth_verifier:e.oauth_verifier,oauth_token:e.oauth_token};s.oauth_verifier&&s.oauth_token&&(t.url+="?"+n.stringify(s));var o=this.client.toHeader(this.client.authorize(t));return Promise.resolve(r(t.url,{method:"POST",headers:Object.assign({},u,o)}).then(h._handleResponseTextOrJson))}catch(e){return Promise.reject(e)}},h.prototype._makeRequest=function(e,t,r){var s={url:this.url+"/"+t+(this.config.extension?".json":""),method:e};return r&&("POST"===e?s.data=r:s.url+="?"+n.stringify(r)),{requestData:s,headers:"User"===this.authType?this.client.toHeader(this.client.authorize(s,this.token)):{Authorization:"Bearer "+this.config.bearer_token}}},h.prototype.get=function(e,t){var n=this._makeRequest("GET",e,t);return r(n.requestData.url,{headers:n.headers}).then(h._handleResponse)},h.prototype.post=function(e,t){var s=this._makeRequest("POST",e,a.includes(e)?null:t),o=s.requestData,i=Object.assign({},u,s.headers);return a.includes(e)?t=JSON.stringify(t):(t=c(n.stringify(t)),i["Content-Type"]="application/x-www-form-urlencoded"),r(o.url,{method:"POST",headers:i,body:t}).then(h._handleResponse)},h.prototype.put=function(e,t,n){var s=this._makeRequest("PUT",e,t),o=s.requestData,i=Object.assign({},u,s.headers);return n=JSON.stringify(n),r(o.url,{method:"PUT",headers:i,body:n}).then(h._handleResponse)},h.prototype.delete=function(e,t,n){var s=this._makeRequest("DELETE",e,t),o=s.requestData,i=Object.assign({},u,s.headers);return n=JSON.stringify(n),r(o.url,{method:"DELETE",headers:i,body:n}).then(h._handleResponse)},h.prototype.stream=function(e,t){var i=this;if("User"!==this.authType)throw new Error("Streams require user context authentication");var a=new s,u={url:o("stream")+"/"+e+(this.config.extension?".json":""),method:"POST"};t&&(u.data=t);var h=this.client.toHeader(this.client.authorize(u,this.token));return r(u.url,{method:"POST",headers:Object.assign({},h,{"Content-Type":"application/x-www-form-urlencoded"}),body:c(n.stringify(t))}).then(function(e){a.destroy=i.stream.destroy=function(){return e.body.destroy()},e.ok?a.emit("start",e):(e._headers=e.headers,a.emit("error",e)),e.body.on("data",function(e){return a.parse(e)}).on("error",function(e){return a.emit("error",e)}).on("end",function(){return a.emit("end",e)})}).catch(function(e){return a.emit("error",e)}),a},module.exports=h});
//# sourceMappingURL=twitter.umd.js.map
