/* DT-01 unified, per-variant collector progress. Counts only catalogued keys. */
(()=>{'use strict';
const PREFIX='wfb-droid-tycoon-v3-';
function read(group){try{const s=JSON.parse(localStorage.getItem(PREFIX+group)||'{}');return s&&typeof s==='object'&&!Array.isArray(s)?s:{}}catch{return {}}}
function count(group,items,variants){const saved=read(group);let done=0;const isIcon=group==='icons';for(let i=0;i<items.length;i++){const base=items[i].name+'#'+i;if(isIcon){if(saved[base]===true)done++}else for(const v of variants)if(saved[base+'|'+v]===true)done++;}return done}
function calculate(){const d=window.TRACKER_DATA||{},variants=d.variants||[],droids=d.droids||[],fusions=d.fusionDroids||[],icons=d.icons||[];const a=count('droids',droids,variants),b=count('fusionen',fusions,variants),c=count('icons',icons,variants);const maxdroids=droids.length*variants.length,maxfusions=fusions.length*variants.length,maxicons=icons.length,total=a+b+c,max=maxdroids+maxfusions+maxicons;return {droids:a,maxdroids,fusions:b,maxfusions,icons:c,maxicons,total,max,percent:max?Math.round(100*total/max):0}}
window.DT01Progress={count,calculate};
})();
