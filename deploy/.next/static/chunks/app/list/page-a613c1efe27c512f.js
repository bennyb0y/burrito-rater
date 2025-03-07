(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[631],{255:(e,t,r)=>{"use strict";function s(e){let{moduleIds:t}=e;return null}Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"PreloadChunks",{enumerable:!0,get:function(){return s}}),r(5155),r(7650),r(5744),r(589)},1162:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>d});var s=r(5155),a=r(2115),n=r(6874),l=r.n(n),i=r(5028),o=r(8070);let c=(0,i.default)(()=>Promise.all([r.e(84),r.e(824)]).then(r.bind(r,4824)),{loadableGenerated:{webpack:()=>[4824]},ssr:!1,loading:()=>(0,s.jsx)("div",{className:"flex items-center justify-center h-full",children:(0,s.jsx)("div",{className:"animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"})})});function d(){let[e,t]=(0,a.useState)([]),[r,n]=(0,a.useState)("rating"),[i,d]=(0,a.useState)("high"),[u,x]=(0,a.useState)(""),[f,h]=(0,a.useState)(!0);(0,a.useEffect)(()=>{(async()=>{try{h(!0),console.log("Fetching ratings from API");let e=await fetch((0,o.e)("ratings"));if(!e.ok){let t=await e.text();throw console.error("API Error (".concat(e.status,"): ").concat(t)),Error("Failed to fetch ratings: ".concat(e.status," ").concat(e.statusText))}let r=await e.json();console.log("Fetched ratings:",r);let s=r.filter(e=>{let t="number"==typeof e.confirmed&&1===e.confirmed||"boolean"==typeof e.confirmed&&!0===e.confirmed;return console.log("Rating ".concat(e.id," (").concat(e.restaurantName,"): confirmed=").concat(e.confirmed,", isConfirmed=").concat(t)),t});console.log("Filtered ".concat(r.length," ratings to ").concat(s.length," confirmed ratings")),t(s)}catch(e){console.error("Error fetching ratings:",e)}finally{h(!1)}})()},[]);let m=()=>{let t=[...e];return u&&(t=t.filter(e=>{var t;return(null===(t=e.zipcode)||void 0===t?void 0:t.toLowerCase())===u.toLowerCase()})),t.sort((e,t)=>"rating"===r?"high"===i?t.rating-e.rating:e.rating-t.rating:"high"===i?t.price-e.price:e.price-t.price)},g=e=>{let t=[];return e.hasPotatoes&&t.push("\uD83E\uDD54 Potatoes"),e.hasCheese&&t.push("\uD83E\uDDC0 Cheese"),e.hasBacon&&t.push("\uD83E\uDD53 Bacon"),e.hasChorizo&&t.push("\uD83C\uDF2D Chorizo"),e.hasAvocado&&t.push("\uD83E\uDD51 Avocado"),e.hasVegetables&&t.push("\uD83E\uDD6C Vegetables"),t.join(" • ")||"No ingredients listed"},p=e=>new Date(e).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"});return(0,s.jsxs)("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8",children:[(0,s.jsxs)("div",{className:"flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6",children:[(0,s.jsx)("h1",{className:"text-xl sm:text-2xl font-bold text-gray-900",children:"Burrito Ratings"}),(0,s.jsxs)("div",{className:"flex flex-col sm:flex-row gap-4 w-full sm:w-auto",children:[(0,s.jsxs)("div",{className:"flex items-center gap-2 w-full sm:w-auto",children:[(0,s.jsx)("input",{type:"text",placeholder:"Filter by zipcode",value:u,onChange:e=>x(e.target.value),className:"px-3 py-1 rounded-md border border-gray-300 text-sm text-gray-700 bg-white w-full sm:w-32"}),u&&(0,s.jsx)("button",{onClick:()=>x(""),className:"text-gray-500 hover:text-gray-700",children:"✕"})]}),(0,s.jsxs)("div",{className:"flex gap-2 w-full sm:w-auto",children:[(0,s.jsxs)("select",{value:r,onChange:e=>n(e.target.value),className:"px-3 py-1 rounded-md border border-gray-300 text-sm text-gray-700 bg-white flex-1 sm:flex-none",children:[(0,s.jsx)("option",{value:"rating",children:"Sort by Rating"}),(0,s.jsx)("option",{value:"price",children:"Sort by Price"})]}),(0,s.jsxs)("select",{value:i,onChange:e=>d(e.target.value),className:"px-3 py-1 rounded-md border border-gray-300 text-sm text-gray-700 bg-white flex-1 sm:flex-none",children:[(0,s.jsx)("option",{value:"high",children:"High to Low"}),(0,s.jsx)("option",{value:"low",children:"Low to High"})]})]})]})]}),(0,s.jsxs)("div",{className:"mb-4 text-sm text-gray-600",children:[m().length," ",1===m().length?"result":"results"," found"]}),(0,s.jsx)("div",{className:"grid gap-3",children:m().map(e=>(0,s.jsx)("div",{className:"bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:border-blue-500 transition-colors",children:(0,s.jsxs)("div",{className:"flex flex-col sm:flex-row gap-3",children:[(0,s.jsx)("div",{className:"w-full sm:w-36 h-36 flex-shrink-0",children:(0,s.jsx)(c,{latitude:e.latitude,longitude:e.longitude,rating:e.rating,restaurantName:e.restaurantName,burritoTitle:e.burritoTitle})}),(0,s.jsxs)("div",{className:"flex-1 flex flex-col",children:[(0,s.jsxs)("div",{className:"flex justify-between items-start",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)("h2",{className:"text-base font-bold text-gray-900",children:e.restaurantName}),(0,s.jsx)("p",{className:"text-sm text-gray-600",children:e.burritoTitle}),(0,s.jsxs)("div",{className:"mt-1 flex items-center gap-1",children:[(0,s.jsx)("span",{className:"text-xs text-gray-500 italic",children:"by"}),(0,s.jsx)("span",{className:"text-xs font-bold text-gray-700",children:e.reviewerName||"Anonymous"}),e.reviewerEmoji&&(0,s.jsx)("span",{className:"text-sm",children:e.reviewerEmoji}),(0,s.jsx)("span",{className:"text-xs text-gray-500 ml-2",children:e.createdAt?p(e.createdAt):""})]})]}),(0,s.jsxs)("div",{className:"flex flex-col items-end",children:[(0,s.jsxs)("div",{className:"bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1",children:[(0,s.jsx)("span",{className:"text-base font-bold text-blue-800",children:e.rating}),(0,s.jsx)("span",{className:"text-xs text-blue-600",children:"/5"})]}),(0,s.jsxs)("div",{className:"text-xs text-gray-600 mt-1",children:["$",e.price.toFixed(2)]}),e.zipcode&&(0,s.jsxs)("div",{className:"text-xs text-gray-500 mt-1",children:["ZIP: ",e.zipcode]})]})]}),(0,s.jsxs)("div",{className:"mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600",children:[(0,s.jsxs)("div",{className:"flex items-center gap-1",children:[(0,s.jsx)("span",{children:"\uD83D\uDE0B"}),(0,s.jsxs)("span",{children:["Taste: ",e.taste.toFixed(1)]})]}),(0,s.jsxs)("div",{className:"flex items-center gap-1",children:[(0,s.jsx)("span",{children:"\uD83D\uDCB0"}),(0,s.jsxs)("span",{children:["Value: ",e.value.toFixed(1)]})]}),(0,s.jsxs)("div",{className:"flex items-center gap-1",children:[(0,s.jsx)("span",{children:"\uD83E\uDDE9"}),(0,s.jsxs)("span",{children:["Ingredients: ",g(e)]})]})]}),e.review&&(0,s.jsxs)("div",{className:"mt-2 text-xs text-gray-700 line-clamp-2",children:['"',e.review,'"']}),(0,s.jsx)("div",{className:"mt-2 flex justify-end",children:(0,s.jsx)(l(),{href:"/?lat=".concat(e.latitude,"&lng=").concat(e.longitude),className:"text-xs text-blue-600 hover:text-blue-800",children:"View on Map →"})})]})]})},e.id))})]})}},2146:(e,t,r)=>{"use strict";function s(e){let{reason:t,children:r}=e;return r}Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"BailoutToCSR",{enumerable:!0,get:function(){return s}}),r(5262)},4054:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),!function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{bindSnapshot:function(){return l},createAsyncLocalStorage:function(){return n},createSnapshot:function(){return i}});let r=Object.defineProperty(Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available"),"__NEXT_ERROR_CODE",{value:"E504",enumerable:!1,configurable:!0});class s{disable(){throw r}getStore(){}run(){throw r}exit(){throw r}enterWith(){throw r}static bind(e){return e}}let a="undefined"!=typeof globalThis&&globalThis.AsyncLocalStorage;function n(){return a?new a:new s}function l(e){return a?a.bind(e):s.bind(e)}function i(){return a?a.snapshot():function(e,...t){return e(...t)}}},4992:(e,t,r)=>{Promise.resolve().then(r.bind(r,1162))},5028:(e,t,r)=>{"use strict";r.d(t,{default:()=>a.a});var s=r(6645),a=r.n(s)},5744:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"workAsyncStorage",{enumerable:!0,get:function(){return s.workAsyncStorageInstance}});let s=r(7828)},6645:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"default",{enumerable:!0,get:function(){return a}});let s=r(8229)._(r(7357));function a(e,t){var r;let a={};"function"==typeof e&&(a.loader=e);let n={...a,...t};return(0,s.default)({...n,modules:null==(r=n.loadableGenerated)?void 0:r.modules})}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},7357:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"default",{enumerable:!0,get:function(){return o}});let s=r(5155),a=r(2115),n=r(2146);function l(e){return{default:e&&"default"in e?e.default:e}}r(255);let i={loader:()=>Promise.resolve(l(()=>null)),loading:null,ssr:!0},o=function(e){let t={...i,...e},r=(0,a.lazy)(()=>t.loader().then(l)),o=t.loading;function c(e){let l=o?(0,s.jsx)(o,{isLoading:!0,pastDelay:!0,error:null}):null,i=!t.ssr||!!t.loading,c=i?a.Suspense:a.Fragment,d=t.ssr?(0,s.jsxs)(s.Fragment,{children:[null,(0,s.jsx)(r,{...e})]}):(0,s.jsx)(n.BailoutToCSR,{reason:"next/dynamic",children:(0,s.jsx)(r,{...e})});return(0,s.jsx)(c,{...i?{fallback:l}:{},children:d})}return c.displayName="LoadableComponent",c}},7828:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"workAsyncStorageInstance",{enumerable:!0,get:function(){return s}});let s=(0,r(4054).createAsyncLocalStorage)()},8070:(e,t,r)=>{"use strict";r.d(t,{e:()=>s});let s=e=>{let t="https://your-worker-name.your-account.workers.dev";console.log("Using API base URL: ".concat(t));let r=e;return e.startsWith("/api/")||e.startsWith("api/")?e.startsWith("/")&&(r=e.substring(1)):r="api/".concat(e),"".concat(t,"/").concat(r)}}},e=>{var t=t=>e(e.s=t);e.O(0,[874,441,684,358],()=>t(4992)),_N_E=e.O()}]);