function projectiveCoefficients(points) {
 const [p0,p1,p2,p3]=points;
 if(points.length!==4||points.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.x>1||p.y<0||p.y>1))throw Error('Adjust all four crop corners.');
 const cross=(a,b,c)=>(b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x);
 const cs=[cross(p0,p1,p2),cross(p1,p2,p3),cross(p2,p3,p0),cross(p3,p0,p1)];
 if(cs.some(v=>v<=.002))throw Error('Keep the crop corners in order around the page.');
 const dx1=p1.x-p2.x,dx2=p3.x-p2.x,dx3=p0.x-p1.x+p2.x-p3.x;
 const dy1=p1.y-p2.y,dy2=p3.y-p2.y,dy3=p0.y-p1.y+p2.y-p3.y;
 const det=dx1*dy2-dx2*dy1;if(Math.abs(det)<1e-8)throw Error('Adjust the crop corners.');
 const g=(dx3*dy2-dx2*dy3)/det,h=(dx1*dy3-dx3*dy1)/det;
 return {a:p1.x-p0.x+g*p1.x,b:p3.x-p0.x+h*p3.x,c:p0.x,d:p1.y-p0.y+g*p1.y,e:p3.y-p0.y+h*p3.y,f:p0.y,g,h};
}
function mapPoint(t,u,v){const z=t.g*u+t.h*v+1;return {x:(t.a*u+t.b*v+t.c)/z,y:(t.d*u+t.e*v+t.f)/z};}
module.exports={projectiveCoefficients,mapPoint};
