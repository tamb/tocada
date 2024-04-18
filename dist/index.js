function A(L,b){if(L<b)return b-L;else return L-b}class H{element;startX=0;startY=0;startTime=0;startPressure=0;endPressure=0;startingElement=null;touchedElements=[];thresholds;eventPrefix="";gestureStartDistance=0;latestGestureDistance=0;isMultiTouch=!1;activeTouches=0;touchCount=0;constructor(L,b={}){if(this.element=typeof L==="string"?document.querySelector(L):L,!this.element){console.error("Element not found");return}const{thresholds:j={},eventPrefix:k=""}=b;this.thresholds={swipeThreshold:j.swipeThreshold||50},this.eventPrefix=k,this.element.addEventListener("touchstart",this.handleTouchStart,!1),this.element.addEventListener("touchmove",this.handleTouchMove,!1),this.element.addEventListener("touchend",this.handleTouchEnd,!1)}destroy(){this.element?.removeEventListener("touchstart",this.handleTouchStart),this.element?.removeEventListener("touchmove",this.handleTouchMove),this.element?.removeEventListener("touchend",this.handleTouchEnd)}handleTouchStart=(L)=>{if(this.activeTouches+=L.changedTouches.length,this.touchCount=L.touches.length,this.activeTouches>1)this.isMultiTouch=!0,this.gestureStartDistance=this.getDistanceBetweenTouchPoints(L.touches),this.handleGestureStart(L);else this.isMultiTouch=!1,this.handleSwipeStart(L)};handleTouchMove=(L)=>{L.preventDefault();const b=L.touches[0].clientX,j=L.touches[0].clientY,k=document.elementFromPoint(b,j);if(k)this.touchedElements.push(k);if(this.isMultiTouch)this.handleGestureMove(L)};handleTouchEnd=(L)=>{if(this.activeTouches>=2)this.handleGestureEnd(L),this.touchCount=0;else if(this.activeTouches===1)this.handleSwipeEnd(L),this.touchCount=0;this.activeTouches-=L.changedTouches.length};handleSwipeStart=(L)=>{const b=L.touches[0];this.startX=b.clientX,this.startY=b.clientY,this.startTime=Date.now(),this.startPressure=b.force||0,this.startingElement=document.elementsFromPoint(this.startX,this.startY)[0],this.touchedElements.push(this.startingElement)};handleSwipeEnd=(L)=>{if(!this.isMultiTouch&&this.touchCount===1){const b=L.changedTouches[0],j=Date.now(),k=j-this.startTime,w=A(this.startX,b.clientX),z=A(this.startY,b.clientY),B=Math.abs(w),C=Math.abs(z),F=Math.hypot(B,C),I=w/k,J=z/k,K=F/k;this.endPressure=b.force||0;const M=(this.startPressure+this.endPressure)/2,Q=document.elementFromPoint(b.clientX,b.clientY),G={velocityX:I,velocityY:J,velocity:K,avgPressure:M,startPressure:this.startPressure,endPressure:this.endPressure,startTime:this.startTime,endTime:j,distanceX:B,distanceY:C,distance:F,startingElement:this.startingElement,endingElement:Q,touchedElements:this.touchedElements};this.dispatchSwipeEvent("swipe",G);const R=this.startX<b.clientX?"swiperight":"swipeleft",U=this.startY<b.clientY?"swipedown":"swipeup",V=w>z?R:U;this.dispatchSwipeEvent(V,G),this.touchedElements=[]}};handleGestureStart=(L)=>{this.isMultiTouch=!0};handleGestureMove=(L)=>{this.latestGestureDistance=this.getDistanceBetweenTouchPoints(L.touches)};handleGestureEnd=(L)=>{if(this.isMultiTouch=!1,this.dispatchGestureEvent("gesture"),this.latestGestureDistance<this.gestureStartDistance)this.dispatchGestureEvent("pinch");else this.dispatchGestureEvent("spread");this.latestGestureDistance=0};getDistanceBetweenTouchPoints=(L)=>{const b=L[0].clientX-L[1].clientX,j=L[0].clientY-L[1].clientY;return Math.hypot(b,j)};dispatchSwipeEvent=(L,b)=>{const j=this.eventPrefix+L,k=new CustomEvent(j,{detail:b});this.element.dispatchEvent(k)};dispatchGestureEvent=(L)=>{const b=this.eventPrefix+L,j=new CustomEvent(b);this.element.dispatchEvent(j)}}export{H as default};

//# debugId=E65204557D0CB36C64756e2164756e21
