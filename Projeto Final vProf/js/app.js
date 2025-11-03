const o = document.getElementById("o"),
x = document.getElementById("x"),
ok = document.getElementById("ok");

function c(){
    o.classList.remove("show")
}
[x,ok].forEach(b=>b.onclick=c);
o.onclick=e=>e.target===o&&c();
onkeydown=e=>e.key==="Escape"&&c();
onload=()=>o.classList.add("show");