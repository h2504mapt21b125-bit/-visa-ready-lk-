const DOCS = ["Passport copy","National Identity Card (NIC)","Birth Certificate","Educational Certificates","Bank Balance Certificate","Sponsor Documents"];

let students = [
 {id:"VR-2026-001",name:"Nimal Perera",dob:"2002-04-18",passport:"N8765432",phone:"077 123 4567",docs:{"Passport copy":true,"National Identity Card (NIC)":true,"Birth Certificate":true,"Educational Certificates":true,"Bank Balance Certificate":false,"Sponsor Documents":false}},
 {id:"VR-2026-002",name:"Amaya Silva",dob:"2001-09-23",passport:"N7654321",phone:"071 222 3344",docs:{"Passport copy":true,"National Identity Card (NIC)":true,"Birth Certificate":true,"Educational Certificates":true,"Bank Balance Certificate":true,"Sponsor Documents":true}},
 {id:"VR-2026-003",name:"Kasun Fernando",dob:"2003-01-07",passport:"N6543210",phone:"076 555 6677",docs:{"Passport copy":true,"National Identity Card (NIC)":true,"Birth Certificate":false,"Educational Certificates":true,"Bank Balance Certificate":false,"Sponsor Documents":false}}
];

let selectedDocStudent = students[0]?.id;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const initials = n => n.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase();
const completed = s => DOCS.filter(d=>s.docs[d]).length;
const missing = s => DOCS.filter(d=>!s.docs[d]);
const statusOf = s => missing(s).length===0 ? "Ready for Review" : "Incomplete Documents";
const statusClass = s => missing(s).length===0 ? "ready" : "incomplete";

function toast(msg){
 const t=$("#toast");
 t.textContent=msg;
 t.classList.add("show");
 setTimeout(()=>t.classList.remove("show"),2600);
}

function go(page){
 $$(".page").forEach(p=>p.classList.remove("active"));
 $("#page-"+page).classList.add("active");
 $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
 $("#crumbPage").textContent=({dashboard:"Dashboard",students:"Students",documents:"Documents",verification:"Smart Verification",reports:"Readiness Reports"})[page];
 $("#sidebar").classList.remove("open");
 window.scrollTo(0,0);
 if(page==="documents")renderChecklist();
 if(page==="verification")renderVerifySelect();
 if(page==="reports")renderReports();
}

$$(".nav-item").forEach(b=>b.addEventListener("click",()=>go(b.dataset.page)));
$$("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
$("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
$("#closeNotice").addEventListener("click",e=>e.target.closest(".notice").remove());

function studentRows(list){
 return list.map(s=>`<tr><td><div class="student-cell"><div class="mini-avatar">${initials(s.name)}</div><div><b>${esc(s.name)}</b><small>${esc(s.phone||"No contact added")}</small></div></div></td><td>${s.id}</td><td>${s.dob}</td><td>${completed(s)}/${DOCS.length}</td><td><span class="status ${statusClass(s)}">${statusOf(s)}</span></td><td><button class="action-link" data-student-doc="${s.id}">Documents →</button></td></tr>`).join("");
}

function renderStudents(){
 const q=($("#studentSearch")?.value||"").toLowerCase();
 const list=students.filter(s=>(s.name+s.id).toLowerCase().includes(q));
 $("#studentsTable").innerHTML=studentRows(list)||'<tr><td colspan="6">No matching students found.</td></tr>';
 $("#studentCountLabel").textContent=`${list.length} student record(s)`;
 $$("[data-student-doc]").forEach(b=>b.addEventListener("click",()=>{
  selectedDocStudent=b.dataset.studentDoc;
  go("documents");
 }));
}

function renderDashboard(){
 const totalDocs=students.reduce((a,s)=>a+completed(s),0);
 $("#statStudents").textContent=students.length;
 $("#statDocs").textContent=totalDocs;
 $("#statPending").textContent=students.filter(s=>missing(s).length>0).length;
 $("#statReady").textContent=students.filter(s=>missing(s).length===0).length;
 $("#recentStudents").innerHTML=students.slice(0,5).map(s=>`<tr><td><div class="student-cell"><div class="mini-avatar">${initials(s.name)}</div><div><b>${esc(s.name)}</b><small>${esc(s.phone||"Student")}</small></div></div></td><td>${s.id}</td><td>${completed(s)}/${DOCS.length}</td><td><span class="status ${statusClass(s)}">${statusOf(s)}</span></td><td><button class="action-link" data-student-doc="${s.id}">View →</button></td></tr>`).join("");
 $$("[data-student-doc]").forEach(b=>b.addEventListener("click",()=>{
  selectedDocStudent=b.dataset.studentDoc;
  go("documents");
 }));
}

function renderDocSelect(){
 const sel=$("#documentStudentSelect");
 sel.innerHTML=students.map(s=>`<option value="${s.id}">${esc(s.name)} · ${s.id}</option>`).join("");
 if(students.some(s=>s.id===selectedDocStudent))sel.value=selectedDocStudent;
}

function renderChecklist(){
 if(!students.length){
  $("#documentChecklist").innerHTML="<p>No students yet. Add a student first.</p>";
  return;
 }
 renderDocSelect();
 const s=students.find(x=>x.id===$("#documentStudentSelect").value)||students[0];
 selectedDocStudent=s.id;
 $("#documentChecklist").innerHTML=DOCS.map((d,i)=>`<div class="doc-item"><div class="doc-symbol">▤</div><div class="doc-info"><b>${d}</b><small>${s.docs[d]?"Marked as uploaded in this demo":"Required document · Not uploaded"}</small></div>${s.docs[d]?'<span class="uploaded">✓ Added</span>':`<label class="upload-btn" for="file-${i}">＋ Upload<input id="file-${i}" type="file" accept=".pdf,.jpg,.jpeg,.png"></label>`}</div>`).join("");
 DOCS.forEach((d,i)=>{
  const input=$(`#file-${i}`);
  if(input)input.addEventListener("change",()=>{
   if(input.files[0]){
    s.docs[d]=true;
    toast(`${d} marked as added (demo only)`);
    renderAll();
    renderChecklist();
   }
  });
 });
}

$("#documentStudentSelect").addEventListener("change",e=>{
 selectedDocStudent=e.target.value;
 renderChecklist();
});

function renderVerifySelect(){
 const sel=$("#verifyStudent");
 sel.innerHTML=students.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join("");
}

$("#verifyField").addEventListener("change",()=>{
 const f=$("#verifyField").value;
 const s=students.find(x=>x.id===$("#verifyStudent").value)||students[0];
 $("#passportValue").value=f==="name"?s.name:f==="dob"?s.dob:s.passport;
 $("#otherValue").value="";
});

$("#verifyStudent").addEventListener("change",()=>$("#verifyField").dispatchEvent(new Event("change")));

$("#compareBtn").addEventListener("click",()=>{
 const a=$("#passportValue").value.trim();
 const b=$("#otherValue").value.trim();
 const r=$("#verifyResult");
 if(!a||!b){
  toast("Enter both document values first.");
  return;
 }
 const match=a.toLowerCase()===b.toLowerCase();
 r.className="verify-result "+(match?"match":"mismatch");
 r.innerHTML=match?`<strong>✓ Values match</strong><br>The entered values are identical. Staff should still review the original documents.`:`<strong>⚠ Possible difference detected</strong><br>The entered values do not match. Please check the original documents and confirm whether correction is required.`;
});

function renderReports(){
 $("#reportsTable").innerHTML=students.map(s=>`<tr><td><b>${esc(s.name)}</b><br><small>${s.id}</small></td><td>${Math.round(completed(s)/DOCS.length*100)}%</td><td>${missing(s).length}</td><td><span class="status ${statusClass(s)}">${statusOf(s)}</span></td><td><button class="action-link" data-report-doc="${s.id}">Review →</button></td></tr>`).join("");
 $$("[data-report-doc]").forEach(b=>b.addEventListener("click",()=>{
  selectedDocStudent=b.dataset.reportDoc;
  go("documents");
 }));
}

function renderAll(){
 renderDashboard();
 renderStudents();
 renderReports();
}

function esc(x){
 return String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

function openModal(){
 $("#studentModal").classList.remove("hidden");
}

function closeModal(){
 $("#studentModal").classList.add("hidden");
 $("#studentForm").reset();
}

$("#openStudentModal").addEventListener("click",openModal);
$("#closeStudentModal").addEventListener("click",closeModal);
$("#cancelStudent").addEventListener("click",closeModal);

$("#studentModal").addEventListener("click",e=>{
 if(e.target.id==="studentModal")closeModal();
});

$("#studentForm").addEventListener("submit",e=>{
 e.preventDefault();
 const name=$("#newName").value.trim();
 const s={
  id:"VR-2026-"+String(students.length+1).padStart(3,"0"),
  name,
  dob:$("#newDob").value,
  passport:$("#newPassport").value.trim(),
  phone:$("#newPhone").value.trim(),
  docs:Object.fromEntries(DOCS.map(d=>[d,false]))
 };
 students.unshift(s);
 selectedDocStudent=s.id;
 closeModal();
 renderAll();
 toast("Student profile created in this demo.");
});

$("#studentSearch").addEventListener("input",renderStudents);
$("#printReport").addEventListener("click",()=>window.print());

/* Sakura falling petals animation */
(function createSakuraPetals(){
 const layer=document.getElementById("petalLayer");
 if(!layer)return;

 const colors=["#ff9fc5","#ffc2dc","#f7a9d0","#e6b8f4","#fff0f7"];

 for(let i=0;i<24;i++){
  const petal=document.createElement("span");
  petal.className="sakura-petal";
  petal.style.left=(Math.random()*100)+"vw";
  petal.style.animationDuration=(9+Math.random()*12)+"s";
  petal.style.animationDelay=(-Math.random()*18)+"s";
  petal.style.setProperty("--petal-color",colors[i%colors.length]);
  petal.style.setProperty("--drift",(Math.random()*180-90)+"px");
  petal.style.setProperty("--spin",(Math.random()*720-360)+"deg");
  petal.style.opacity=(0.55+Math.random()*0.4).toFixed(2);
  layer.appendChild(petal);
 }
})();

renderAll();
renderChecklist();
renderVerifySelect();
