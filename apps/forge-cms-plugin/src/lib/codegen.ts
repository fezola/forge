import { framer } from "framer-plugin";
import type { ComponentConfigSchema, PropConfig } from "@forge/forge-components";

interface ComponentEntry {
  id: string;
  schema: ComponentConfigSchema;
}

export interface CodeGenResult {
  runtimeFileId: string;
  componentFiles: Array<{ componentId: string; fileId: string }>;
}

function propToControlType(prop: PropConfig): string {
  switch (prop.type) {
    case "string": return "ControlType.String";
    case "number": return "ControlType.Number";
    case "boolean": return "ControlType.Boolean";
    case "select": return "ControlType.Enum";
    case "color": return "ControlType.Color";
    case "image": return "ControlType.ResponsiveImage";
    case "slot": return "ControlType.ComponentInstance";
    default: return "ControlType.String";
  }
}

function buildControlDefinition(key: string, prop: PropConfig): string {
  const lines: string[] = [`    ${key}: {`];
  lines.push(`      type: ${propToControlType(prop)},`);
  lines.push(`      title: "${prop.label || key}",`);
  if (prop.defaultValue !== undefined) {
    lines.push(`      defaultValue: ${JSON.stringify(prop.defaultValue)},`);
  }
  if (prop.placeholder) {
    lines.push(`      placeholder: "${prop.placeholder}",`);
  }
  if (prop.type === "select" && prop.options) {
    lines.push(`      options: ${JSON.stringify(prop.options.map(o => o.value))},`);
    lines.push(`      optionTitles: ${JSON.stringify(prop.options.map(o => o.label))},`);
  }
  if (prop.type === "number") {
    lines.push(`      min: 0,`);
    lines.push(`      max: 999999,`);
  }
  lines.push(`    },`);
  return lines.join("\n");
}

function componentName(id: string): string {
  return id
    .replace(/^forge-/, "")
    .split("-")
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

export function generateInteractiveComponent(
  componentId: string,
  schema: ComponentConfigSchema
): string {
  const name = componentName(componentId);
  const propEntries = Object.entries(schema.props);
  const hasEvent = (schema.events && Object.keys(schema.events).length > 0) ? true : false;

  const hasWidth = propEntries.some(([k]) => k === "width");
  const hasPadding = propEntries.some(([k]) => k === "padding");
  const hasGap = propEntries.some(([k]) => k === "gap");
  const hasBorderRadius = propEntries.some(([k]) => k === "borderRadius");

  const extraSig: string[] = [];
  if (!hasWidth) extraSig.push("width = 400");
  if (!hasPadding) extraSig.push("padding = 24");
  if (!hasGap) extraSig.push("gap = 16");
  if (!hasBorderRadius) extraSig.push("borderRadius = 12");

  const propSignature = propEntries
    .map(([key, p]) => {
      const def = p.defaultValue !== undefined ? ` = ${JSON.stringify(p.defaultValue)}` : "";
      return `${key}${def}`;
    })
    .join(", ");

  const allSig = propSignature + (extraSig.length ? ", " + extraSig.join(", ") : "");

  const renderCode = generateRenderCode(componentId, name, propEntries, hasEvent);

  return `export default function ${name}({ ${allSig} }) {
const{useState}=React;
const cw=Math.max(340,Math.min(640,width));
const ws={width:"100%",minWidth:340,maxWidth:cw,fontFamily:"system-ui,-apple-system,sans-serif",boxSizing:"border-box",margin:"0 auto",minHeight:740};
${renderCode}
`;
}

function generateRenderCode(
  componentId: string,
  _name: string,
  _propEntries: Array<[string, PropConfig]>,
  _hasEvent: boolean
): string {
  const S = "const S={container:{fontFamily:'system-ui,-apple-system,sans-serif',boxSizing:'border-box'}}"
  const SP = `
var EmIco=React.createElement("svg",{width:14,height:14,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2},React.createElement("rect",{x:2,y:4,width:20,height:16,rx:2}),React.createElement("path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"}))
var PwIco=React.createElement("svg",{width:14,height:14,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2},React.createElement("rect",{x:3,y:11,width:18,height:11,rx:2,ry:2}),React.createElement("path",{d:"M7 11V7a5 5 0 0 1 10 0v4"}))
var NmIco=React.createElement("svg",{width:14,height:14,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2},React.createElement("path",{d:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"}),React.createElement("circle",{cx:12,cy:7,r:4}))
function Fld(p){var[h,setH]=React.useState(false);return React.createElement("div",null,React.createElement("label",{style:{fontSize:13,fontWeight:500,color:"#111",marginBottom:6,display:"block"}},p.label),React.createElement("div",{style:{position:"relative"}},React.createElement("span",{style:{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:"#a1a1aa",pointerEvents:"none",zIndex:1,display:"flex"}},p.icon),React.createElement("input",{value:p.val,onChange:function(e){p.set(e.target.value)},placeholder:p.placeholder,type:p.type||"text",onFocus:function(){setH(true)},onBlur:function(){setH(false)},style:{width:"100%",padding:"10px 12px 10px 36px",border:h?"1.5px solid #111":"1.5px solid #e4e4e7",borderRadius:p.r-2,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:"#fafafa",transition:"border-color 0.12s"}}),p.right?React.createElement("span",{style:{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)"}},p.right()):null))}
function RShow(p){return React.createElement("button",{onClick:function(){p.set(function(v){return!v})},style:{background:"none",border:"none",padding:4,cursor:"pointer",color:"#a1a1aa",display:"flex",fontSize:"inherit"}},p.show?React.createElement("svg",{width:14,height:14,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2},React.createElement("path",{d:"M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"}),React.createElement("path",{d:"M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"}),React.createElement("line",{x1:1,y1:1,x2:23,y2:23})):React.createElement("svg",{width:14,height:14,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2},React.createElement("path",{d:"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"}),React.createElement("circle",{cx:12,cy:12,r:3})))}
function Soc(p){var b={width:"100%",padding:"9px 0",borderRadius:p.r-2,background:"transparent",border:"1px solid #e4e4e7",color:"#111",fontSize:13.5,fontWeight:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxSizing:"border-box"};return React.createElement(React.Fragment,null,React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:p.gap||8,marginBottom:p.mb||16}},p.showGoogle?React.createElement("button",{style:b},React.createElement("svg",{width:16,height:16,viewBox:"0 0 24 24"},React.createElement("path",{fill:"currentColor",d:"M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"}),React.createElement("path",{fill:"currentColor",d:"M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"}),React.createElement("path",{fill:"currentColor",d:"M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"}),React.createElement("path",{fill:"currentColor",d:"M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"})),"Continue with Google"):null,p.showGitHub?React.createElement("button",{style:b},React.createElement("svg",{width:16,height:16,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2},React.createElement("path",{d:"M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"}),React.createElement("path",{d:"M9 18c-4.51 2-5-2-7-2"})),"Continue with GitHub"):null,p.showApple?React.createElement("button",{style:b},React.createElement("svg",{width:16,height:16,viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C5.18 17.22 4.57 13.5 5.98 10.9c.88-1.6 2.28-2.6 3.9-2.6 1.36 0 2.36.72 3.2.72.85 0 2.26-.8 3.96-.68 1.26.05 2.6.65 3.48 1.82-.3.2-2.08 1.18-2.08 3.56 0 2.6 2.2 3.56 2.32 3.6-.1.4-.64 2.04-1.71 3.28zM15.04 4.5c.2-1.06.75-2.07 1.45-2.8.85-.88 2.08-1.35 2.9-1.35.04 1.12-.35 2.28-1.1 3.16-.65.78-1.8 1.52-2.85 1.42-.1-1.07.24-2.04 1.1-2.78z"})),"Continue with Apple"):null,p.showMagicLink?React.createElement("button",{style:b},React.createElement("svg",{width:16,height:16,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2},React.createElement("rect",{x:2,y:4,width:20,height:16,rx:2}),React.createElement("path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"})),"Magic Link"):null),React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:16}},React.createElement("div",{style:{flex:1,height:1,background:"#e4e4e7"}}),React.createElement("span",{style:{fontSize:11.5,color:"#d4d4d8",fontWeight:500}},"OR"),React.createElement("div",{style:{flex:1,height:1,background:"#e4e4e7"}})))}
function Btn(p){return React.createElement("button",{onClick:p.onClick,disabled:p.loading,style:{width:"100%",marginTop:16,padding:"10px 0",borderRadius:p.r-2,background:p.loading?"#6b7280":"#111",color:"#fff",border:"none",fontSize:14,fontWeight:590,cursor:p.loading?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}},p.loading?React.createElement("svg",{width:16,height:16,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2.5,style:{animation:"forge-spin .6s linear infinite"}},React.createElement("path",{d:"M21 12a9 9 0 1 1-6.219-8.56",strokeLinecap:"round"})):null,p.children)}`
  switch (componentId) {
    case "forge-button": {
      return `${S}
  const bg=variant==="ghost"?"transparent":variant==="outline"?"transparent":"#111"
  const b=variant==="outline"?"1.5px solid #111":"none"
  const c=variant==="ghost"||variant==="outline"?"#111":"#fff"
  const p=size==="sm"?"6px 14px":size==="lg"?"12px 28px":"9px 20px"
  const fs=size==="sm"?12.5:size==="lg"?15.5:14
  const w=fullWidth?"100%":"auto"
  return(<div style={{...S.container,background:bg,border:b,color:c,padding:p,fontSize:fs,borderRadius:8,cursor:"pointer",textAlign:"center",fontWeight:590,display:"inline-block",width:w,transition:"all .12s",userSelect:"none"}}>{label}</div>)`;
    }

    case "forge-text": {
      return `${S}
  const m={h1:{fontSize:30,fontWeight:700,lineHeight:1.15,letterSpacing:"-.03em"},h2:{fontSize:22,fontWeight:650,lineHeight:1.2,letterSpacing:"-.02em"},h3:{fontSize:18,fontWeight:600,lineHeight:1.3,letterSpacing:"-.01em"},body:{fontSize:15,fontWeight:400,lineHeight:1.6},caption:{fontSize:12,fontWeight:400,lineHeight:1.5,color:"#999"}}
  return<div style={{...S.container,...(m[variant]||m.body)}}>{value}</div>`;
    }

    case "forge-input": {
      return `${S}
  return(<div style={S.container}>
    {label?<label style={{fontSize:12.5,fontWeight:500,color:"#333",marginBottom:5,display:"block"}}>{label}</label>:null}
    <input type={type} placeholder={placeholder} style={{width:"100%",padding:"9px 12px",border:"1.5px solid #e4e4e7",borderRadius:8,fontSize:13.5,outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:"#fafafa",transition:"border-color .12s",color:"#111"}} onFocus={function(e){e.target.style.borderColor="#111";e.target.style.background="#fff"}} onBlur={function(e){e.target.style.borderColor="#e4e4e7";if(!e.target.value)e.target.style.background="#fafafa"}} />
  </div>)`;
    }

    case "forge-badge": {
      return `${S}
  const cm={default:{bg:"#f5f5f5",text:"#555"},secondary:{bg:"#e8e8ee",text:"#555"},success:{bg:"#dcfce7",text:"#166534"},warning:{bg:"#fef9c3",text:"#854d0e"},danger:{bg:"#fee2e2",text:"#dc2626"}}
  const cx=cm[variant]||cm.default
  const s=size==="sm"?{py:"1px",px:"7px",fs:11}:size==="lg"?{py:"4px",px:"12px",fs:13}:{py:"2px",px:"9px",fs:12}
  return<span style={{...S.container,display:"inline-block",background:cx.bg,color:cx.text,padding:s.py+" "+s.px,borderRadius:9999,fontSize:s.fs,fontWeight:600,lineHeight:"20px"}}>{label}</span>`;
    }

    case "forge-avatar": {
      return `${S}
  const dim=size==="sm"?32:size==="lg"?64:48
  if(imageUrl){return<img src={imageUrl} alt="" style={{...S.container,width:dim,height:dim,borderRadius:"50%",objectFit:"cover",flexShrink:0}} />}
  return(<div style={{...S.container,width:dim,height:dim,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:dim*0.4,fontWeight:600,flexShrink:0}}>{fallback}</div>)`;
    }

    case "forge-card": {
      return `${S}
  const cs=variant==="elevated"?{boxShadow:"0 4px 16px rgba(0,0,0,0.08)",border:"none",background:"#fff"}:variant==="outline"?{border:"1.5px solid #e4e4e7",boxShadow:"none",background:"#fff"}:{border:"1.5px solid #eee",boxShadow:"0 1px 3px rgba(0,0,0,0.04)",background:"#fff"}
  return(<div style={{...S.container,...cs,borderRadius:12,padding:padding,minHeight:100,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#bbb",fontSize:13}}>Card · {padding}px padding</span></div>)`;
    }

    case "forge-auth-sign-in": {
      return `  const[view,setView]=useState("sign-in")
  const[email,setEmail]=useState("");const[password,setPassword]=useState("");const[confirmPassword,setConfirmPassword]=useState("");const[name,setName]=useState("");const[loading,setLoading]=useState(false);const[showPw,setShowPw]=useState(false);const[err,setErr]=useState("");const[sent,setSent]=useState(false)
  const handleSignIn=async function(){if(!email){setErr("Email required");return}if(!password){setErr("Password required");return}setLoading(true);setErr("");try{await new Promise(function(r){setTimeout(r,1200)})}catch(e){setErr(e.message)}finally{setLoading(false)}}
  const handleSignUp=async function(){if(!name){setErr("Name required");return}if(!email){setErr("Email required");return}if(!password){setErr("Password required");return}if(password!==confirmPassword){setErr("Passwords do not match");return}setLoading(true);setErr("");try{await new Promise(function(r){setTimeout(r,1200)})}catch(e){setErr(e.message)}finally{setLoading(false)}}
  const handleForgot=async function(){if(!email){setErr("Email required");return}setLoading(true);setErr("");try{await new Promise(function(r){setTimeout(r,1200)});setSent(true)}catch(e){setErr(e.message)}finally{setLoading(false)}}
  const handleReset=async function(){if(!password){setErr("Password required");return}if(password!==confirmPassword){setErr("Passwords do not match");return}setLoading(true);setErr("");try{await new Promise(function(r){setTimeout(r,1200)});setSent(true)}catch(e){setErr(e.message)}finally{setLoading(false)}}
  const card={width:"100%",maxWidth:cw,background:"#fff",border:"1px solid #e4e4e7",borderRadius,padding:Math.max(20,Math.min(32,Math.round(padding)))+"px 24px",margin:"0 auto",boxShadow:"0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)",boxSizing:"border-box"}
  const hasSocial=showGoogle||showGitHub||showApple||showMagicLink
  function go(v){setErr("");setView(v)}
  // Sign In view
  if(view==="sign-in"){
    return(<div style={ws}>
      <div style={card}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:36,height:36,borderRadius:9,background:"#111",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:16,fontWeight:700,margin:"0 auto 16px"}}>F</div>
          <div style={{fontSize:19,fontWeight:650,color:"#111",letterSpacing:"-.02em"}}>Welcome back</div>
          <div style={{fontSize:13.5,color:"#a1a1aa",marginTop:4}}>Sign in to continue.</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Fld label="Email address" icon={EmIco} val={email} set={setEmail} placeholder="jane@example.com" type="email" r={borderRadius}/>
          <Fld label="Password" icon={PwIco} val={password} set={setPassword} placeholder="Enter your password" type={showPw?"text":"password"} r={borderRadius} right={function(){return<RShow show={showPw} set={setShowPw}/>}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:12}}>
          {showRememberMe&&<label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:"#a1a1aa",cursor:"pointer"}}><input type="checkbox" style={{accentColor:"#111"}}/> Remember me</label>}
          <span onClick={function(){go("forgot-password")}} style={{fontSize:13,color:"#6366f1",fontWeight:500,cursor:"pointer",marginLeft:showRememberMe?"auto":0}}>Forgot password?</span>
        </div>
        {err&&<div style={{marginTop:12,padding:"8px 12px",borderRadius:borderRadius-4,background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",fontSize:12.5}}>{err}</div>}
        <Btn onClick={handleSignIn} loading={loading} r={borderRadius}>{loading?"Signing in\u2026":buttonText}</Btn>
        {hasSocial&&<div style={{marginTop:16}}><Soc gap={8} mb={0} showGoogle={showGoogle} showGitHub={showGitHub} showApple={showApple} showMagicLink={showMagicLink} r={borderRadius}/></div>}
        <div style={{marginTop:18,textAlign:"center",fontSize:13,color:"#a1a1aa"}}>Don't have an account? <span onClick={function(){go("sign-up");setName("");setConfirmPassword("")}} style={{color:"#6366f1",fontWeight:500,cursor:"pointer"}}>Create one</span></div>
      </div>
    </div>)
  }
  // Sign Up view
  if(view==="sign-up"){
    return(<div style={ws}>
      <div style={card}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:36,height:36,borderRadius:9,background:"#111",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:16,fontWeight:700,margin:"0 auto 16px"}}>F</div>
          <div style={{fontSize:19,fontWeight:650,color:"#111",letterSpacing:"-.02em"}}>Create your account</div>
          <div style={{fontSize:13.5,color:"#a1a1aa",marginTop:4}}>Get started free.</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Fld label="Full name" icon={NmIco} val={name} set={setName} placeholder="Jane Doe" r={borderRadius}/>
          <Fld label="Email address" icon={EmIco} val={email} set={setEmail} placeholder="jane@example.com" type="email" r={borderRadius}/>
          <Fld label="Password" icon={PwIco} val={password} set={setPassword} placeholder="Create a password" type={showPw?"text":"password"} r={borderRadius} right={function(){return<RShow show={showPw} set={setShowPw}/>}}/>
          <Fld label="Confirm password" icon={PwIco} val={confirmPassword} set={setConfirmPassword} placeholder="Re-enter password" type="password" r={borderRadius}/>
        </div>
        {showTerms&&<label style={{display:"flex",alignItems:"center",gap:6,marginTop:12,fontSize:13,color:"#a1a1aa",cursor:"pointer"}}><input type="checkbox" style={{accentColor:"#111"}}/> I agree to the Terms & Privacy Policy</label>}
        {err&&<div style={{marginTop:12,padding:"8px 12px",borderRadius:borderRadius-4,background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",fontSize:12.5}}>{err}</div>}
        <Btn onClick={handleSignUp} loading={loading} r={borderRadius}>{loading?"Creating account\u2026":buttonText}</Btn>
        {hasSocial&&<div style={{marginTop:16}}><Soc gap={8} mb={0} showGoogle={showGoogle} showGitHub={showGitHub} showApple={showApple} showMagicLink={showMagicLink} r={borderRadius}/></div>}
        <div style={{marginTop:18,textAlign:"center",fontSize:13,color:"#a1a1aa"}}>Already have an account? <span onClick={function(){go("sign-in");setPassword("")}} style={{color:"#6366f1",fontWeight:500,cursor:"pointer"}}>Sign in</span></div>
      </div>
    </div>)
  }
  // Forgot Password view
  if(view==="forgot-password"){
    if(sent)return(<div style={ws}><div style={{...card,textAlign:"center"}}>
      <div style={{fontSize:36,marginBottom:16}}>📧</div>
      <div style={{fontSize:17,fontWeight:650,color:"#111",marginBottom:8}}>Check your email</div>
      <div style={{fontSize:13,color:"#a1a1aa",lineHeight:1.5}}>We've sent a password reset link to {email}. It may take a few minutes to arrive.</div>
      <div style={{marginTop:18}}><span onClick={function(){go("sign-in");setSent(false)}} style={{color:"#6366f1",fontWeight:500,cursor:"pointer",fontSize:13}}>Back to sign in</span></div>
    </div></div>)
    return(<div style={ws}>
      <div style={card}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:28,marginBottom:12}}>🔑</div>
          <div style={{fontSize:19,fontWeight:650,color:"#111",letterSpacing:"-.02em"}}>Forgot password?</div>
          <div style={{fontSize:13.5,color:"#a1a1aa",marginTop:4}}>Enter your email and we'll send you a reset link.</div>
        </div>
        <Fld label="Email address" icon={EmIco} val={email} set={setEmail} placeholder="jane@example.com" type="email" r={borderRadius}/>
        {err&&<div style={{marginTop:12,padding:"8px 12px",borderRadius:borderRadius-4,background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",fontSize:12.5}}>{err}</div>}
        <Btn onClick={handleForgot} loading={loading} r={borderRadius}>{loading?"Sending\u2026":"Send Reset Link"}</Btn>
        <div style={{marginTop:18,textAlign:"center",fontSize:13,color:"#a1a1aa"}}><span onClick={function(){go("sign-in")}} style={{color:"#6366f1",fontWeight:500,cursor:"pointer"}}>Back to sign in</span></div>
      </div>
    </div>)
  }
  // Reset Password view
  if(view==="reset-password"){
    if(sent)return(<div style={ws}><div style={{...card,textAlign:"center"}}>
      <div style={{fontSize:36,marginBottom:16}}>✅</div>
      <div style={{fontSize:17,fontWeight:650,color:"#111",marginBottom:8}}>Password reset successful</div>
      <div style={{fontSize:13,color:"#a1a1aa"}}>Your password has been updated. You can now sign in with your new password.</div>
      <div style={{marginTop:18}}><span onClick={function(){go("sign-in");setSent(false)}} style={{color:"#6366f1",fontWeight:500,cursor:"pointer",fontSize:13}}>Back to sign in</span></div>
    </div></div>)
    return(<div style={ws}>
      <div style={card}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:36,height:36,borderRadius:9,background:"#111",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:16,fontWeight:700,margin:"0 auto 16px"}}>F</div>
          <div style={{fontSize:19,fontWeight:650,color:"#111",letterSpacing:"-.02em"}}>Set new password</div>
          <div style={{fontSize:13.5,color:"#a1a1aa",marginTop:4}}>Must be at least 8 characters.</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Fld label="New password" icon={PwIco} val={password} set={setPassword} placeholder="Enter new password" type={showPw?"text":"password"} r={borderRadius} right={function(){return<RShow show={showPw} set={setShowPw}/>}}/>
          <Fld label="Confirm password" icon={PwIco} val={confirmPassword} set={setConfirmPassword} placeholder="Re-enter new password" type="password" r={borderRadius}/>
        </div>
        {err&&<div style={{marginTop:12,padding:"8px 12px",borderRadius:borderRadius-4,background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",fontSize:12.5}}>{err}</div>}
        <Btn onClick={handleReset} loading={loading} r={borderRadius}>{loading?"Resetting\u2026":"Reset Password"}</Btn>
      </div>
    </div>)
  }
  return null`+SP;
    }
    case "forge-auth-sign-up": {
      return `  const[view,setView]=useState("sign-up")
  const[email,setEmail]=useState("");const[password,setPassword]=useState("");const[confirmPassword,setConfirmPassword]=useState("");const[name,setName]=useState("");const[loading,setLoading]=useState(false);const[showPw,setShowPw]=useState(false);const[err,setErr]=useState("");const[sent,setSent]=useState(false)
  const handleSignIn=async function(){if(!email){setErr("Email required");return}if(!password){setErr("Password required");return}setLoading(true);setErr("");try{await new Promise(function(r){setTimeout(r,1200)})}catch(e){setErr(e.message)}finally{setLoading(false)}}
  const handleSignUp=async function(){if(!name){setErr("Name required");return}if(!email){setErr("Email required");return}if(!password){setErr("Password required");return}if(password!==confirmPassword){setErr("Passwords do not match");return}setLoading(true);setErr("");try{await new Promise(function(r){setTimeout(r,1200)})}catch(e){setErr(e.message)}finally{setLoading(false)}}
  const handleForgot=async function(){if(!email){setErr("Email required");return}setLoading(true);setErr("");try{await new Promise(function(r){setTimeout(r,1200)});setSent(true)}catch(e){setErr(e.message)}finally{setLoading(false)}}
  const handleReset=async function(){if(!password){setErr("Password required");return}if(password!==confirmPassword){setErr("Passwords do not match");return}setLoading(true);setErr("");try{await new Promise(function(r){setTimeout(r,1200)});setSent(true)}catch(e){setErr(e.message)}finally{setLoading(false)}}
  const card={width:"100%",maxWidth:cw,background:"#fff",border:"1px solid #e4e4e7",borderRadius,padding:Math.max(20,Math.min(32,Math.round(padding)))+"px 24px",margin:"0 auto",boxShadow:"0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)",boxSizing:"border-box"}
  const hasSocial=showGoogle||showGitHub||showApple||showMagicLink
  function go(v){setErr("");setView(v)}
  // Sign In view
  if(view==="sign-in"){
    return(<div style={ws}>
      <div style={card}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:36,height:36,borderRadius:9,background:"#111",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:16,fontWeight:700,margin:"0 auto 16px"}}>F</div>
          <div style={{fontSize:19,fontWeight:650,color:"#111",letterSpacing:"-.02em"}}>Welcome back</div>
          <div style={{fontSize:13.5,color:"#a1a1aa",marginTop:4}}>Sign in to continue.</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Fld label="Email address" icon={EmIco} val={email} set={setEmail} placeholder="jane@example.com" type="email" r={borderRadius}/>
          <Fld label="Password" icon={PwIco} val={password} set={setPassword} placeholder="Enter your password" type={showPw?"text":"password"} r={borderRadius} right={function(){return<RShow show={showPw} set={setShowPw}/>}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:12}}>
          {showRememberMe&&<label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:"#a1a1aa",cursor:"pointer"}}><input type="checkbox" style={{accentColor:"#111"}}/> Remember me</label>}
          <span onClick={function(){go("forgot-password")}} style={{fontSize:13,color:"#6366f1",fontWeight:500,cursor:"pointer",marginLeft:showRememberMe?"auto":0}}>Forgot password?</span>
        </div>
        {err&&<div style={{marginTop:12,padding:"8px 12px",borderRadius:borderRadius-4,background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",fontSize:12.5}}>{err}</div>}
        <Btn onClick={handleSignIn} loading={loading} r={borderRadius}>{loading?"Signing in\u2026":buttonText}</Btn>
        {hasSocial&&<div style={{marginTop:16}}><Soc gap={8} mb={0} showGoogle={showGoogle} showGitHub={showGitHub} showApple={showApple} showMagicLink={showMagicLink} r={borderRadius}/></div>}
        <div style={{marginTop:18,textAlign:"center",fontSize:13,color:"#a1a1aa"}}>Don't have an account? <span onClick={function(){go("sign-up");setName("");setConfirmPassword("")}} style={{color:"#6366f1",fontWeight:500,cursor:"pointer"}}>Create one</span></div>
      </div>
    </div>)
  }
  // Sign Up view
  if(view==="sign-up"){
    return(<div style={ws}>
      <div style={card}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:36,height:36,borderRadius:9,background:"#111",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:16,fontWeight:700,margin:"0 auto 16px"}}>F</div>
          <div style={{fontSize:19,fontWeight:650,color:"#111",letterSpacing:"-.02em"}}>Create your account</div>
          <div style={{fontSize:13.5,color:"#a1a1aa",marginTop:4}}>Get started free.</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Fld label="Full name" icon={NmIco} val={name} set={setName} placeholder="Jane Doe" r={borderRadius}/>
          <Fld label="Email address" icon={EmIco} val={email} set={setEmail} placeholder="jane@example.com" type="email" r={borderRadius}/>
          <Fld label="Password" icon={PwIco} val={password} set={setPassword} placeholder="Create a password" type={showPw?"text":"password"} r={borderRadius} right={function(){return<RShow show={showPw} set={setShowPw}/>}}/>
          <Fld label="Confirm password" icon={PwIco} val={confirmPassword} set={setConfirmPassword} placeholder="Re-enter password" type="password" r={borderRadius}/>
        </div>
        {showTerms&&<label style={{display:"flex",alignItems:"center",gap:6,marginTop:12,fontSize:13,color:"#a1a1aa",cursor:"pointer"}}><input type="checkbox" style={{accentColor:"#111"}}/> I agree to the Terms & Privacy Policy</label>}
        {err&&<div style={{marginTop:12,padding:"8px 12px",borderRadius:borderRadius-4,background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",fontSize:12.5}}>{err}</div>}
        <Btn onClick={handleSignUp} loading={loading} r={borderRadius}>{loading?"Creating account\u2026":buttonText}</Btn>
        {hasSocial&&<div style={{marginTop:16}}><Soc gap={8} mb={0} showGoogle={showGoogle} showGitHub={showGitHub} showApple={showApple} showMagicLink={showMagicLink} r={borderRadius}/></div>}
        <div style={{marginTop:18,textAlign:"center",fontSize:13,color:"#a1a1aa"}}>Already have an account? <span onClick={function(){go("sign-in");setPassword("")}} style={{color:"#6366f1",fontWeight:500,cursor:"pointer"}}>Sign in</span></div>
      </div>
    </div>)
  }
  // Forgot Password view
  if(view==="forgot-password"){
    if(sent)return(<div style={ws}><div style={{...card,textAlign:"center"}}>
      <div style={{fontSize:36,marginBottom:16}}>📧</div>
      <div style={{fontSize:17,fontWeight:650,color:"#111",marginBottom:8}}>Check your email</div>
      <div style={{fontSize:13,color:"#a1a1aa",lineHeight:1.5}}>We've sent a password reset link to {email}. It may take a few minutes to arrive.</div>
      <div style={{marginTop:18}}><span onClick={function(){go("sign-in");setSent(false)}} style={{color:"#6366f1",fontWeight:500,cursor:"pointer",fontSize:13}}>Back to sign in</span></div>
    </div></div>)
    return(<div style={ws}>
      <div style={card}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:28,marginBottom:12}}>🔑</div>
          <div style={{fontSize:19,fontWeight:650,color:"#111",letterSpacing:"-.02em"}}>Forgot password?</div>
          <div style={{fontSize:13.5,color:"#a1a1aa",marginTop:4}}>Enter your email and we'll send you a reset link.</div>
        </div>
        <Fld label="Email address" icon={EmIco} val={email} set={setEmail} placeholder="jane@example.com" type="email" r={borderRadius}/>
        {err&&<div style={{marginTop:12,padding:"8px 12px",borderRadius:borderRadius-4,background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",fontSize:12.5}}>{err}</div>}
        <Btn onClick={handleForgot} loading={loading} r={borderRadius}>{loading?"Sending\u2026":"Send Reset Link"}</Btn>
        <div style={{marginTop:18,textAlign:"center",fontSize:13,color:"#a1a1aa"}}><span onClick={function(){go("sign-in")}} style={{color:"#6366f1",fontWeight:500,cursor:"pointer"}}>Back to sign in</span></div>
      </div>
    </div>)
  }
  // Reset Password view
  if(view==="reset-password"){
    if(sent)return(<div style={ws}><div style={{...card,textAlign:"center"}}>
      <div style={{fontSize:36,marginBottom:16}}>✅</div>
      <div style={{fontSize:17,fontWeight:650,color:"#111",marginBottom:8}}>Password reset successful</div>
      <div style={{fontSize:13,color:"#a1a1aa"}}>Your password has been updated. You can now sign in with your new password.</div>
      <div style={{marginTop:18}}><span onClick={function(){go("sign-in");setSent(false)}} style={{color:"#6366f1",fontWeight:500,cursor:"pointer",fontSize:13}}>Back to sign in</span></div>
    </div></div>)
    return(<div style={ws}>
      <div style={card}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:36,height:36,borderRadius:9,background:"#111",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:16,fontWeight:700,margin:"0 auto 16px"}}>F</div>
          <div style={{fontSize:19,fontWeight:650,color:"#111",letterSpacing:"-.02em"}}>Set new password</div>
          <div style={{fontSize:13.5,color:"#a1a1aa",marginTop:4}}>Must be at least 8 characters.</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Fld label="New password" icon={PwIco} val={password} set={setPassword} placeholder="Enter new password" type={showPw?"text":"password"} r={borderRadius} right={function(){return<RShow show={showPw} set={setShowPw}/>}}/>
          <Fld label="Confirm password" icon={PwIco} val={confirmPassword} set={setConfirmPassword} placeholder="Re-enter new password" type="password" r={borderRadius}/>
        </div>
        {err&&<div style={{marginTop:12,padding:"8px 12px",borderRadius:borderRadius-4,background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",fontSize:12.5}}>{err}</div>}
        <Btn onClick={handleReset} loading={loading} r={borderRadius}>{loading?"Resetting\u2026":"Reset Password"}</Btn>
      </div>
    </div>)
  }
  return null`+SP;
    }
    case "forge-auth-forgot-password": {
      return `
  const[email,setEmail]=useState("");const[loading,setLoading]=useState(false);const[sent,setSent]=useState(false);const[err,setErr]=useState("")
  const handle=async function(){if(!email){setErr("Email required");return}setLoading(true);setErr("");try{await new Promise(function(r){setTimeout(r,1200)});setSent(true)}catch(e){setErr(e.message)}finally{setLoading(false)}}
  if(sent)return(<div style={ws}><div style={{width:"100%",maxWidth:cw,background:"#fff",border:"1px solid #e4e4e7",borderRadius,padding:"28px 24px",margin:"0 auto",boxShadow:"0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)",boxSizing:"border-box",textAlign:"center"}}>
    <div style={{fontSize:36,marginBottom:16}}>📧</div>
    <div style={{fontSize:17,fontWeight:650,color:"#111",marginBottom:8}}>Check your email</div>
    <div style={{fontSize:13,color:"#a1a1aa",lineHeight:1.5}}>We've sent a password reset link to {email}. It may take a few minutes to arrive.</div>
  </div></div>)
  return(<div style={ws}>
    <div style={{width:"100%",maxWidth:cw,background:"#fff",border:"1px solid #e4e4e7",borderRadius,padding:"28px 24px",margin:"0 auto",boxShadow:"0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)",boxSizing:"border-box"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:28,marginBottom:12}}>🔑</div>
        <div style={{fontSize:19,fontWeight:650,color:"#111",letterSpacing:"-.02em"}}>Forgot password?</div>
        <div style={{fontSize:13.5,color:"#a1a1aa",marginTop:4}}>Enter your email and we'll send you a reset link.</div>
      </div>
      <Fld label="Email address" icon={EmIco} val={email} set={setEmail} placeholder="jane@example.com" type="email" r={borderRadius}/>
      {err&&<div style={{marginTop:12,padding:"8px 12px",borderRadius:borderRadius-4,background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",fontSize:12.5}}>{err}</div>}
      <Btn onClick={handle} loading={loading} r={borderRadius}>{loading?"Sending\u2026":buttonText}</Btn>
      <div style={{marginTop:18,textAlign:"center",fontSize:13,color:"#a1a1aa"}}><span style={{color:"#6366f1",fontWeight:500,cursor:"pointer"}}>Back to sign in</span></div>
    </div>
  </div>)`+SP;
    }
    case "forge-auth-reset-password": {
      return `
  const[password,setPassword]=useState("");const[cp,setCp]=useState("");const[loading,setLoading]=useState(false);const[done,setDone]=useState(false);const[showPw,setShowPw]=useState(false);const[err,setErr]=useState("")
  const handle=async function(){if(!password){setErr("Password required");return}if(password!==cp){setErr("Passwords do not match");return}setLoading(true);setErr("");try{await new Promise(function(r){setTimeout(r,1200)});setDone(true)}catch(e){setErr(e.message)}finally{setLoading(false)}}
  if(done)return(<div style={ws}><div style={{width:"100%",maxWidth:cw,background:"#fff",border:"1px solid #e4e4e7",borderRadius,padding:"28px 24px",margin:"0 auto",boxShadow:"0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)",boxSizing:"border-box",textAlign:"center"}}>
    <div style={{fontSize:36,marginBottom:16}}>✅</div>
    <div style={{fontSize:17,fontWeight:650,color:"#111",marginBottom:8}}>Password reset successful</div>
    <div style={{fontSize:13,color:"#a1a1aa"}}>Your password has been updated. You can now sign in with your new password.</div>
  </div></div>)
  return(<div style={ws}>
    <div style={{width:"100%",maxWidth:cw,background:"#fff",border:"1px solid #e4e4e7",borderRadius,padding:"28px 24px",margin:"0 auto",boxShadow:"0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)",boxSizing:"border-box"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{width:36,height:36,borderRadius:9,background:"#111",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:16,fontWeight:700,margin:"0 auto 16px"}}>F</div>
        <div style={{fontSize:19,fontWeight:650,color:"#111",letterSpacing:"-.02em"}}>Set new password</div>
        <div style={{fontSize:13.5,color:"#a1a1aa",marginTop:4}}>Must be at least 8 characters.</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Fld label="New password" icon={PwIco} val={password} set={setPassword} placeholder="Enter new password" type={showPw?"text":"password"} r={borderRadius} right={function(){return<RShow show={showPw} set={setShowPw}/>}}/>
        <Fld label="Confirm password" icon={PwIco} val={cp} set={setCp} placeholder="Re-enter new password" type="password" r={borderRadius}/>
      </div>
      {err&&<div style={{marginTop:12,padding:"8px 12px",borderRadius:borderRadius-4,background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",fontSize:12.5}}>{err}</div>}
      <Btn onClick={handle} loading={loading} r={borderRadius}>{loading?"Resetting\u2026":buttonText}</Btn>
    </div>
  </div>)`+SP;
    }
    case "forge-auth-accept-invite": {
      return `
  const[name,setName]=useState("");const[password,setPassword]=useState("");const[cp,setCp]=useState("");const[loading,setLoading]=useState(false);const[showPw,setShowPw]=useState(false);const[err,setErr]=useState("")
  const handle=async function(){if(!name){setErr("Name required");return}if(!password){setErr("Password required");return}if(password!==cp){setErr("Passwords do not match");return}setLoading(true);setErr("");try{await new Promise(function(r){setTimeout(r,1200)})}catch(e){setErr(e.message)}finally{setLoading(false)}}
  return(<div style={ws}>
    <div style={{width:"100%",maxWidth:cw,background:"#fff",border:"1px solid #e4e4e7",borderRadius,padding:"28px 24px",margin:"0 auto",boxShadow:"0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)",boxSizing:"border-box"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{width:36,height:36,borderRadius:9,background:"#6366f1",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:16,fontWeight:700,margin:"0 auto 16px"}}>✉</div>
        <div style={{fontSize:19,fontWeight:650,color:"#111",letterSpacing:"-.02em"}}>You're invited!</div>
        <div style={{fontSize:13.5,color:"#a1a1aa",marginTop:4}}>Set up your account to join the team.</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Fld label="Full name" icon={NmIco} val={name} set={setName} placeholder="Jane Doe" r={borderRadius}/>
        <Fld label="Create password" icon={PwIco} val={password} set={setPassword} placeholder="Create a password" type={showPw?"text":"password"} r={borderRadius} right={function(){return<RShow show={showPw} set={setShowPw}/>}}/>
        <Fld label="Confirm password" icon={PwIco} val={cp} set={setCp} placeholder="Re-enter password" type="password" r={borderRadius}/>
      </div>
      {err&&<div style={{marginTop:12,padding:"8px 12px",borderRadius:borderRadius-4,background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",fontSize:12.5}}>{err}</div>}
      <Btn onClick={handle} loading={loading} r={borderRadius}>{loading?"Creating account\u2026":buttonText}</Btn>
    </div>
  </div>)`+SP;
    }
    case "forge-auth-verify-email": {
      return `
  const[resent,setResent]=useState(false);const[loading,setLoading]=useState(false)
  const handle=async function(){setLoading(true);try{await new Promise(function(r){setTimeout(r,800)});setResent(true)}finally{setLoading(false)}}
  return(<div style={ws}>
    <div style={{width:"100%",maxWidth:cw,background:"#fff",border:"1px solid #e4e4e7",borderRadius,padding:"28px 24px",margin:"0 auto",boxShadow:"0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)",boxSizing:"border-box",textAlign:"center"}}>
      <div style={{fontSize:40,marginBottom:16}}>📬</div>
      <div style={{fontSize:17,fontWeight:650,color:"#111",marginBottom:8}}>Verify your email</div>
      <div style={{fontSize:13,color:"#a1a1aa",lineHeight:1.5,marginBottom:20}}>{email?<>We sent a verification email to <strong>{email}</strong>. Click the link to activate your account.</>:"We've sent you a verification email. Click the link to activate your account."}</div>
      <button onClick={handle} disabled={loading||resent} style={{width:"100%",padding:"10px 0",borderRadius:borderRadius-2,background:loading||resent?"#6b7280":"#111",color:"#fff",border:"none",fontSize:14,fontWeight:590,cursor:loading||resent?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{loading?"Sending\u2026":resent?"Sent!":"Resend verification email"}</button>
    </div>
  </div>)`+SP;
    }
    case "forge-auth-magic-link": {
      return `
  const[email,setEmail]=useState("");const[loading,setLoading]=useState(false);const[sent,setSent]=useState(false);const[err,setErr]=useState("")
  const handle=async function(){if(!email){setErr("Email required");return}setLoading(true);setErr("");try{await new Promise(function(r){setTimeout(r,1200)});setSent(true)}catch(e){setErr(e.message)}finally{setLoading(false)}}
  if(sent)return(<div style={ws}><div style={{width:"100%",maxWidth:cw,background:"#fff",border:"1px solid #e4e4e7",borderRadius,padding:"28px 24px",margin:"0 auto",boxShadow:"0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)",boxSizing:"border-box",textAlign:"center"}}>
    <div style={{fontSize:36,marginBottom:16}}>🔗</div>
    <div style={{fontSize:17,fontWeight:650,color:"#111",marginBottom:8}}>Magic link sent!</div>
    <div style={{fontSize:13,color:"#a1a1aa",lineHeight:1.5}}>Check {email} for your sign-in link. It expires in 15 minutes.</div>
  </div></div>)
  return(<div style={ws}>
    <div style={{width:"100%",maxWidth:cw,background:"#fff",border:"1px solid #e4e4e7",borderRadius,padding:"28px 24px",margin:"0 auto",boxShadow:"0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)",boxSizing:"border-box"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:28,marginBottom:12}}>⚡</div>
        <div style={{fontSize:19,fontWeight:650,color:"#111",letterSpacing:"-.02em"}}>Passwordless sign in</div>
        <div style={{fontSize:13.5,color:"#a1a1aa",marginTop:4}}>We'll email you a magic link to sign in instantly.</div>
      </div>
      <Fld label="Email address" icon={EmIco} val={email} set={setEmail} placeholder="jane@example.com" type="email" r={borderRadius}/>
      {err&&<div style={{marginTop:12,padding:"8px 12px",borderRadius:borderRadius-4,background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",fontSize:12.5}}>{err}</div>}
      <Btn onClick={handle} loading={loading} r={borderRadius}>{loading?"Sending\u2026":buttonText}</Btn>
    </div>
  </div>)`+SP;
    }
    case "forge-auth-update-password": {
      return `
  const[curPw,setCurPw]=useState("");const[password,setPassword]=useState("");const[cp,setCp]=useState("");const[loading,setLoading]=useState(false);const[done,setDone]=useState(false);const[showPw,setShowPw]=useState(false);const[err,setErr]=useState("")
  const handle=async function(){if(!curPw){setErr("Current password required");return}if(!password){setErr("New password required");return}if(password!==cp){setErr("Passwords do not match");return}setLoading(true);setErr("");try{await new Promise(function(r){setTimeout(r,1200)});setDone(true)}catch(e){setErr(e.message)}finally{setLoading(false)}}
  if(done)return(<div style={ws}><div style={{width:"100%",maxWidth:cw,background:"#fff",border:"1px solid #e4e4e7",borderRadius,padding:"28px 24px",margin:"0 auto",boxShadow:"0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)",boxSizing:"border-box",textAlign:"center"}}>
    <div style={{fontSize:36,marginBottom:16}}>✅</div>
    <div style={{fontSize:17,fontWeight:650,color:"#111",marginBottom:8}}>Password updated</div>
    <div style={{fontSize:13,color:"#a1a1aa"}}>Your password has been changed successfully.</div>
  </div></div>)
  return(<div style={ws}>
    <div style={{width:"100%",maxWidth:cw,background:"#fff",border:"1px solid #e4e4e7",borderRadius,padding:"28px 24px",margin:"0 auto",boxShadow:"0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)",boxSizing:"border-box"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{width:36,height:36,borderRadius:9,background:"#111",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:16,fontWeight:700,margin:"0 auto 16px"}}>F</div>
        <div style={{fontSize:19,fontWeight:650,color:"#111",letterSpacing:"-.02em"}}>Change password</div>
        <div style={{fontSize:13.5,color:"#a1a1aa",marginTop:4}}>Update your account password.</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Fld label="Current password" icon={PwIco} val={curPw} set={setCurPw} placeholder="Enter current password" type={showPw?"text":"password"} r={borderRadius} right={function(){return<RShow show={showPw} set={setShowPw}/>}}/>
        <Fld label="New password" icon={PwIco} val={password} set={setPassword} placeholder="Enter new password" type={showPw?"text":"password"} r={borderRadius}/>
        <Fld label="Confirm new password" icon={PwIco} val={cp} set={setCp} placeholder="Re-enter new password" type="password" r={borderRadius}/>
      </div>
      {err&&<div style={{marginTop:12,padding:"8px 12px",borderRadius:borderRadius-4,background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",fontSize:12.5}}>{err}</div>}
      <Btn onClick={handle} loading={loading} r={borderRadius}>{loading?"Updating\u2026":buttonText}</Btn>
    </div>
  </div>)`+SP;
    }

    case "forge-user-profile": {
      return `${S}
  const fd=layout==="column"?"column":"row"
  return(<div style={{...S.container,display:"flex",flexDirection:fd,alignItems:"center",gap:14,padding:14,background:"#fff",border:"1.5px solid #eee",borderRadius:12}}>
    {showAvatar&&<div style={{width:42,height:42,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:600,flexShrink:0}}>U</div>}
    <div style={{flex:1,minWidth:0,textAlign:layout==="column"?"center":"left"}}>
      {showName&&<div style={{fontSize:15,fontWeight:600,color:"#111"}}>User Name</div>}
      {showEmail&&<div style={{fontSize:12.5,color:"#999",marginTop:2}}>user@example.com</div>}
    </div>
  </div>)`;
    }

    case "forge-user-avatar": {
      return `${S}
  const dim=size==="sm"?34:size==="lg"?66:50
  return(<div style={{...S.container,width:dim,height:dim,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:dim*0.4,fontWeight:600,flexShrink:0,boxShadow:"0 2px 8px rgba(99,102,241,0.25)"}}>{fallback}</div>)`;
    }

    case "forge-data-table": {
      return `${S}
  const sampleHeaders=["Name","Email","Status","Role"]
  const sampleRows=[["Alice","alice@example.com","Active","Admin"],["Bob","bob@example.com","Active","Editor"],["Carol","carol@example.com","Inactive","Viewer"]]
  return(<div style={{...S.container,overflowX:"auto",border:"1.5px solid #eee",borderRadius:12,background:"#fff"}}>
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}>
      <thead><tr style={{background:"#fafafa"}}>{sampleHeaders.map(function(h){return<th key={h} style={{padding:"9px 12px",textAlign:"left",fontWeight:600,color:"#555",borderBottom:"1.5px solid #eee",whiteSpace:"nowrap"}}>{h}</th>})}</tr></thead>
      <tbody>{sampleRows.map(function(r,i){return<tr key={i}>{r.map(function(c,j){return<td key={j} style={{padding:"8px 12px",borderBottom:"1px solid #f5f5f5",color:"#333"}}>{c}</td>})}</tr>})}</tbody>
    </table>
    <div style={{padding:"7px 12px",fontSize:11,color:"#bbb",borderTop:"1px solid #eee"}}>Page size: {pageSize} · Table: {tableId||"(not set)"}</div>
  </div>)`;
    }

    case "forge-data-card": {
      return `${S}
  return(<div style={{...S.container,border:"1.5px solid #eee",borderRadius:12,padding:16,background:"#fff"}}>
    <div style={{fontSize:11,fontWeight:600,color:"#6366f1",textTransform:"uppercase",marginBottom:8}}>Record</div>
    <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f5f5f5",fontSize:12.5}}><span style={{color:"#999",fontWeight:500}}>ID</span><span style={{fontWeight:500,color:"#111"}}>{itemId||"—"}</span></div>
    <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:12.5}}><span style={{color:"#999",fontWeight:500}}>Table</span><span style={{fontWeight:500,color:"#111"}}>{tableId||"(not set)"}</span></div>
  </div>)`;
    }

    case "forge-data-list": {
      return `${S}
  const sampleItems=[{id:"1",name:"Item A",status:"Active"},{id:"2",name:"Item B",status:"Pending"},{id:"3",name:"Item C",status:"Active"}]
  const isCard=template==="card"
  return(<div style={{...S.container,display:"flex",flexDirection:"column",gap:8}}>
    {sampleItems.map(function(item,i){return<div key={i} style={{border:isCard?"1.5px solid #eee":"1.5px solid #f0f0f0",borderRadius:isCard?12:8,padding:isCard?14:10,background:isCard?"#fff":"#fafafa"}}>
      <div style={{fontSize:12.5,color:"#333",padding:"2px 0"}}><span style={{color:"#999",marginRight:8}}>Name:</span><span style={{fontWeight:500}}>{item.name}</span></div>
      <div style={{fontSize:12.5,color:"#333",padding:"2px 0"}}><span style={{color:"#999",marginRight:8}}>Status:</span><span style={{fontWeight:500}}>{item.status}</span></div>
    </div>})}
    <div style={{fontSize:11,color:"#bbb",textAlign:"center"}}>Table: {tableId||"(not set)"}</div>
  </div>)`;
    }

    case "forge-data-chart": {
      return `${S}
  const bc=["#6366f1","#8b5cf6","#a855f7","#d946ef","#ec4899","#f43f5e"]
  const sampleData=[{label:"Jan",value:40},{label:"Feb",value:70},{label:"Mar",value:30},{label:"Apr",value:90},{label:"May",value:50},{label:"Jun",value:80}]
  const maxVal=100
  if(chartType==="pie"){return(<div style={{...S.container,display:"flex",flexDirection:"column",gap:6,padding:12,border:"1.5px solid #eee",borderRadius:12,background:"#fff"}}>
    <div style={{fontWeight:600,fontSize:12.5,color:"#333",marginBottom:4}}>Distribution</div>
    {sampleData.slice(0,5).map(function(r,i){const pct=r.value;return<div key={i} style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:"50%",background:bc[i],flexShrink:0}}/><span style={{fontSize:12,flex:1,color:"#333"}}>{r.label}</span><div style={{width:60,height:6,background:"#f0f0f0",borderRadius:3,overflow:"hidden"}}><div style={{width:pct+"%",height:"100%",background:bc[i],borderRadius:3}}/></div><span style={{fontSize:10.5,color:"#999",width:30,textAlign:"right"}}>{pct}%</span></div>})}
  </div>)}
  return(<div style={{...S.container,display:"flex",alignItems:"flex-end",gap:6,height:170,padding:"14px 10px",border:"1.5px solid #eee",borderRadius:12,background:"#fff"}}>
    {sampleData.map(function(r,i){const pct=Math.max(r.value/maxVal*100,5);return<div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1,height:"100%",justifyContent:"flex-end"}}>
      <div title={String(r.value)} style={{width:"100%",maxWidth:28,height:pct+"%",background:bc[i],borderRadius:"4px 4px 0 0",minHeight:6}}/>
      {showLabels?<span style={{fontSize:9,color:"#bbb",marginTop:4,overflow:"hidden",textOverflow:"ellipsis",maxWidth:"100%",whiteSpace:"nowrap"}}>{r.label}</span>:null}
    </div>})}
  </div>)`;
    }

    case "forge-payment-button": {
      return `${S}
  const fmt=new Intl.NumberFormat("en-US",{style:"currency",currency:currency}).format(amount)
  const bg=variant==="primary"?"#059669":variant==="outline"?"transparent":"#111"
  const b=variant==="outline"?"1.5px solid #059669":"none"
  const c=variant==="outline"?"#059669":"#fff"
  return(<div style={{...S.container,display:"flex",flexDirection:"column",gap:8,padding:14,border:"1.5px solid #eee",borderRadius:12,background:"#fff"}}>
    {amount>0?<div style={{fontSize:13,color:"#999",textAlign:"center",fontWeight:500}}>{fmt}</div>:null}
    <div style={{background:bg,border:b,color:c,padding:"10px 0",borderRadius:8,textAlign:"center",fontSize:13.5,fontWeight:590,cursor:"pointer",transition:"all .12s"}}>{label}</div>
  </div>)`;
    }

    case "forge-payment-status": {
      return `${S}
  const sx=status==="success"?{ic:"✓",bg:"#dcfce7",c:"#166534"}:status==="pending"?{ic:"○",bg:"#fef9c3",c:"#854d0e"}:{ic:"✗",bg:"#fee2e2",c:"#dc2626"}
  return(<div style={{...S.container,display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:20,border:"1.5px solid #eee",borderRadius:12,background:"#fff"}}>
    <div style={{width:48,height:48,borderRadius:"50%",background:sx.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:sx.c}}>{sx.ic}</div>
    <div style={{fontSize:15.5,fontWeight:600,color:sx.c}}>{status==="success"?"Payment Complete":status==="pending"?"Payment Pending":"Payment Failed"}</div>
    {transactionId?<div style={{fontSize:10.5,color:"#bbb",fontFamily:"monospace",marginTop:2}}>ID: {transactionId.slice(0,16)}</div>:null}
  </div>)`;
    }

    case "forge-wallet-connect": {
      return `${S}
  const nc=network==="solana"?"#9945FF":network==="ethereum"?"#627EEA":"#111"
  return(<div style={{...S.container,display:"flex",flexDirection:"column",gap:8,padding:14,border:"1.5px solid #eee",borderRadius:12,background:"#fff"}}>
    <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:nc}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:nc,display:"inline-block"}}/>
      {network==="solana"?"Solana":network==="ethereum"?"Ethereum":network}
    </div>
    <div style={{background:nc,color:"#fff",padding:"10px 0",borderRadius:8,textAlign:"center",fontSize:13.5,fontWeight:590,cursor:"pointer",transition:"all .12s"}}>{label}</div>
  </div>)`;
    }

    case "forge-wallet-balance": {
      return `${S}
  return(<div style={{...S.container,display:"flex",flexDirection:"column",gap:6,padding:16,border:"1.5px solid #eee",borderRadius:12,background:"#fff"}}>
    <div style={{fontSize:10.5,color:"#bbb",textTransform:"uppercase",letterSpacing:".06em"}}>{token} Balance</div>
    <div style={{fontSize:24,fontWeight:700,color:"#111",letterSpacing:"-.03em"}}>{balance}</div>
    {address?<div style={{fontSize:10,color:"#bbb",fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",marginTop:2}}>{address}</div>:null}
  </div>)`;
    }

    case "forge-nft-card": {
      return `${S}
  return(<div style={{...S.container,border:"1.5px solid #eee",borderRadius:14,overflow:"hidden",background:"#fff"}}>
    <div style={{width:"100%",height:180,background:image?"":"linear-gradient(135deg,#667eea,#764ba2)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:36}}>
      {image?<img src={image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"◆"}
    </div>
    <div style={{padding:14}}>
      <div style={{fontSize:14,fontWeight:600,color:"#111"}}>{name||"NFT #"+(tokenId||"?")}</div>
      {nftAddress?<div style={{fontSize:10.5,color:"#bbb",fontFamily:"monospace",marginTop:4,overflow:"hidden",textOverflow:"ellipsis"}}>{nftAddress.slice(0,24)}...</div>:null}
    </div>
  </div>)`;
    }

    case "forge-ai-generate": {
      return `${S}
  return(<div style={{...S.container,display:"flex",flexDirection:"column",gap:10,padding:14,border:"1.5px solid #eee",borderRadius:12,background:"#fff"}}>
    <textarea placeholder={prompt||"Enter your prompt..."} rows={3} style={{width:"100%",padding:"9px 12px",border:"1.5px solid #e4e4e7",borderRadius:8,fontSize:13,resize:"vertical",boxSizing:"border-box",fontFamily:"inherit",outline:"none",background:"#fafafa"}}/>
    <div style={{display:"flex",gap:8,alignItems:"center"}}>
      <span style={{fontSize:10.5,color:"#999",background:"#f5f5f5",padding:"2px 8px",borderRadius:4,fontWeight:500}}>{model}</span>
      <div style={{background:"#111",color:"#fff",padding:"7px 18px",borderRadius:7,fontSize:12.5,fontWeight:590,cursor:"pointer",marginLeft:"auto"}}>Generate</div>
    </div>
    <div style={{padding:12,background:"#fafafa",borderRadius:8,fontSize:12.5,color:"#bbb",textAlign:"center",lineHeight:"18px"}}>Generated content appears here</div>
  </div>)`;
    }

    case "forge-file-upload": {
      return `${S}
  return(<div style={{...S.container,border:"2px dashed #ddd",borderRadius:12,padding:24,textAlign:"center",cursor:"pointer",background:"#fafafa",transition:"border-color .2s"}}>
    <div style={{fontSize:26,marginBottom:8,opacity:0.6}}>📁</div>
    <div style={{fontSize:13.5,fontWeight:590,color:"#333"}}>{label}</div>
    <div style={{fontSize:11,color:"#bbb",marginTop:4}}>{multiple?"Supports multiple files":"Single file"} · {accept==="*"?"Any type":accept}</div>
  </div>)`;
    }

    case "forge-file-preview": {
      return `${S}
  if(!fileUrl){return(<div style={{...S.container,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,border:"1.5px solid #eee",borderRadius:12,minHeight:120,background:"#fafafa"}}>
    <span style={{fontSize:11.5,color:"#bbb"}}>No file URL configured</span></div>)}
  const isImage=/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(fileUrl)
  if(isImage){return<img src={fileUrl} alt="" style={{...S.container,width:"100%",borderRadius:12,maxHeight:300,objectFit:"cover"}}/>}
  return(<div style={{...S.container,display:"flex",alignItems:"center",gap:12,padding:12,border:"1.5px solid #eee",borderRadius:12,background:"#fff"}}>
    <div style={{fontSize:22,opacity:0.5}}>📄</div>
    <div style={{flex:1,overflow:"hidden"}}>
      <div style={{fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"#333"}}>{fileUrl.split("/").pop()||"file"}</div>
      <div style={{fontSize:11,color:"#bbb"}}>Click to download</div>
    </div>
  </div>)`;
    }

    case "forge-deployment-status": {
      return `${S}
  const cm={active:{bg:"#dcfce7",c:"#166534"},building:{bg:"#dbeafe",c:"#1e40af"},deploying:{bg:"#fef3c7",c:"#92400e"},failed:{bg:"#fee2e2",c:"#dc2626"},pending:{bg:"#f5f5f5",c:"#555"},rolled_back:{bg:"#fce7f3",c:"#9d174d"},cancelled:{bg:"#e5e7eb",c:"#4b5563"}}
  const cx=cm[status]||cm.pending
  return(<div style={{...S.container,display:"flex",alignItems:"center",gap:8,padding:"6px 10px",border:"1.5px solid #eee",borderRadius:8,background:"#fff"}}>
    {environment?<span style={{fontSize:11,color:"#999",background:"#f5f5f5",padding:"2px 8px",borderRadius:4,fontWeight:500}}>{environment}</span>:null}
    <span style={{display:"inline-block",background:cx.bg,color:cx.c,padding:"2px 10px",borderRadius:9999,fontSize:11.5,fontWeight:600,lineHeight:"20px"}}>{status}</span>
  </div>)`;
    }

    case "forge-deployment-metrics": {
      return `${S}
  return(<div style={{...S.container,display:"flex",gap:12,padding:16,border:"1.5px solid #eee",borderRadius:12,background:"#fff"}}>
    {[{l:"Active",v:activeDeploys,c:"#059669"},{l:"Total",v:totalDeploys,c:"#6366f1"},{l:"Uptime",v:uptime,c:"#0891b2"}].map(function(m){return<div key={m.l} style={{flex:1,textAlign:"center"}}>
      <div style={{fontSize:18,fontWeight:700,color:m.c,letterSpacing:"-.02em"}}>{m.v}</div>
      <div style={{fontSize:11,color:"#bbb",marginTop:2}}>{m.l}</div>
    </div>})}
  </div>)`;
    }

    case "forge-enterprise-sso-button": {
      return `${S}
  const pc={google:"#4285F4",microsoft:"#00A4EF",github:"#24292F",apple:"#000",saml:"#6366f1",oidc:"#8b5cf6"}
  const col=pc[provider]||"#6366f1"
  return(<div style={{...S.container,display:"flex",alignItems:"center",gap:8,background:col,color:"#fff",padding:"10px 16px",borderRadius:8,cursor:"pointer",fontSize:13.5,fontWeight:590,justifyContent:"center",transition:"all .12s",userSelect:"none"}}>
    <span>{label} {provider.charAt(0).toUpperCase()+provider.slice(1)}</span>
  </div>)`;
    }

    case "forge-enterprise-compliance-badge": {
      return `${S}
  const sc=status==="compliant"?"#059669":status==="in-progress"?"#d97706":"#dc2626"
  return(<div style={{...S.container,display:"flex",alignItems:"center",gap:10,padding:"8px 14px",border:"1.5px solid #eee",borderRadius:10,background:"#fff"}}>
    <div style={{width:28,height:28,borderRadius:"50%",background:sc+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:sc}}>{status==="compliant"?"✓":status==="in-progress"?"○":"✗"}</div>
    <div>
      <div style={{fontSize:13,fontWeight:600,color:"#111"}}>{standard}</div>
      <div style={{fontSize:11,color:sc,marginTop:1}}>{status}</div>
    </div>
  </div>)`;
    }

    case "forge-enterprise-role-badge": {
      return `${S}
  return(<span style={{...S.container,display:"inline-block",background:color+"15",color:color,padding:"3px 10px",borderRadius:6,fontSize:11.5,fontWeight:600,border:"1px solid "+color+"30",lineHeight:"20px"}}>{role}</span>)`;
    }

    case "forge-marketplace-listing-card": {
      return `${S}
  return(<div style={{...S.container,border:"1.5px solid #eee",borderRadius:14,padding:14,background:"#fff",overflow:"hidden"}}>
    <div style={{width:"100%",height:90,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:10,marginBottom:10}}/>
    <div style={{fontSize:14.5,fontWeight:600,color:"#111"}}>{name}</div>
    <div style={{fontSize:12,color:"#999",marginTop:2}}>{tagline}</div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,fontSize:10.5,color:"#bbb"}}>
      <span style={{background:"#f5f5f5",padding:"1px 6px",borderRadius:4,color:"#888"}}>{category}</span>
      {rating>0?<span>★ {rating.toFixed(1)}</span>:null}
      <span>{installs} installs</span>
    </div>
  </div>)`;
    }

    case "forge-marketplace-install-button": {
      return `${S}
  return(<div style={{...S.container,display:"inline-flex",alignItems:"center",gap:6,background:installed?"#f5f5f5":"#111",color:installed?"#555":"#fff",padding:"8px 18px",borderRadius:8,cursor:installed?"default":"pointer",fontSize:12.5,fontWeight:590,transition:"all .12s",userSelect:"none"}}>
    {installed?"✓ Installed":label}
  </div>)`;
    }

    case "forge-connector-status": {
      return `${S}
  const ic=status==="connected"?"#22c55e":status==="error"?"#ef4444":status==="syncing"?"#f59e0b":"#bbb"
  return(<div style={{...S.container,display:"flex",alignItems:"center",gap:9,padding:"8px 12px",border:"1.5px solid #eee",borderRadius:10,background:"#fff"}}>
    <div style={{width:8,height:8,borderRadius:"50%",background:ic,flexShrink:0}}/>
    <div style={{flex:1}}>
      <div style={{fontSize:13,fontWeight:500,color:"#111"}}>{name}</div>
      <div style={{fontSize:11,color:"#bbb"}}>{status}{lastSync?" · "+lastSync:""}</div>
    </div>
  </div>)`;
    }

    case "forge-connector-data-card": {
      return `${S}
  return(<div style={{...S.container,padding:16,border:"1.5px solid #eee",borderRadius:12,background:"#fff"}}>
    <div style={{fontSize:10.5,color:"#bbb",textTransform:"uppercase",letterSpacing:".06em",fontWeight:500}}>{title}</div>
    <div style={{fontSize:22,fontWeight:700,marginTop:4,color:"#111",letterSpacing:"-.02em"}}>{value}</div>
    {subtitle?<div style={{fontSize:12,color:"#999",marginTop:2}}>{subtitle}</div>:null}
  </div>)`;
    }

    case "forge-ai-chat": {
      return `${S}
  return(<div style={{...S.container,display:"flex",flexDirection:"column",gap:0,border:"1.5px solid #eee",borderRadius:12,overflow:"hidden",background:"#fff"}}>
    <div style={{fontSize:10.5,color:"#999",textAlign:"center",background:"#fafafa",padding:"5px 0",borderBottom:"1px solid #eee",fontWeight:500}}>{model}</div>
    <div style={{display:"flex",flexDirection:"column",gap:6,padding:12,maxHeight:200,overflowY:"auto",minHeight:80}}>
      <div style={{alignSelf:"flex-start",background:"#f5f5f5",padding:"8px 12px",borderRadius:"12px 12px 12px 4px",fontSize:12.5,color:"#333",maxWidth:"80%"}}>Hello! How can I help you today?</div>
      <div style={{alignSelf:"flex-end",background:"#111",color:"#fff",padding:"8px 12px",borderRadius:"12px 12px 4px 12px",fontSize:12.5,maxWidth:"80%"}}>I need help with my project</div>
    </div>
    <div style={{display:"flex",gap:6,padding:"8px 12px",borderTop:"1px solid #eee",background:"#fff"}}>
      <input placeholder={placeholder} style={{flex:1,padding:"8px 12px",border:"1.5px solid #e4e4e7",borderRadius:8,fontSize:12.5,outline:"none",fontFamily:"inherit",background:"#fafafa"}}/>
      <div style={{background:"#111",color:"#fff",padding:"8px 14px",borderRadius:8,fontSize:12.5,fontWeight:590,cursor:"pointer"}}>Send</div>
    </div>
  </div>)`;
    }

    case "forge-ai-agent-chat": {
      return `${S}
  return(<div style={{...S.container,display:"flex",flexDirection:"column",gap:0,border:"1.5px solid #eee",borderRadius:12,overflow:"hidden",background:"#fff"}}>
    <div style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",borderBottom:"1px solid #eee",background:"#fafafa"}}>
      <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#667eea,#764ba2)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:600}}>{agentName[0]}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:600,color:"#111"}}>{agentName}</div>
        <div style={{fontSize:10,color:"#bbb"}}>{model}{memoryEnabled?" · memory":""}</div>
      </div>
    </div>
    <div style={{padding:"8px 12px",display:"flex",flexDirection:"column",gap:6,minHeight:80,maxHeight:180,overflowY:"auto"}}>
      <div style={{alignSelf:"flex-start",background:"#f5f5f5",padding:"8px 12px",borderRadius:"12px 12px 12px 4px",fontSize:12.5,color:"#333",maxWidth:"80%"}}>I'm {agentName}. What would you like to build?</div>
    </div>
    <div style={{padding:"8px 12px",borderTop:"1px solid #eee",display:"flex",gap:6,background:"#fff"}}>
      <input placeholder="Ask your agent..." style={{flex:1,padding:"8px 12px",border:"1.5px solid #e4e4e7",borderRadius:8,fontSize:12.5,outline:"none",fontFamily:"inherit",background:"#fafafa"}}/>
      <div style={{background:"#111",color:"#fff",padding:"8px 12px",borderRadius:8,cursor:"pointer"}}>→</div>
    </div>
  </div>)`;
    }

    case "forge-pricing-table": {
      return `${S}
  const features=["Up to 10 projects","100k API requests","10GB storage","Email support","Custom domain"]
  return(<div style={{...S.container,border:featured?"2px solid #6366f1":"1.5px solid #eee",borderRadius:14,padding:20,background:featured?"#faf5ff":"#fff",position:"relative",display:"flex",flexDirection:"column"}}>
    {featured?<div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:"#6366f1",color:"#fff",fontSize:10,fontWeight:600,padding:"2px 12px",borderRadius:9999,letterSpacing:".04em"}}>POPULAR</div>:null}
    <div style={{fontSize:14,fontWeight:600,color:"#999"}}>{planName}</div>
    <div style={{marginTop:6,display:"flex",alignItems:"baseline",gap:2}}>
      <span style={{fontSize:13,color:"#999"}}>{currency}</span>
      <span style={{fontSize:30,fontWeight:700,color:"#111",letterSpacing:"-.03em"}}>{price}</span>
      <span style={{fontSize:12,color:"#bbb"}}>/{interval}</span>
    </div>
    <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:5}}>
      {features.map(function(f,i){return<div key={i} style={{display:"flex",alignItems:"center",gap:7,fontSize:12.5,color:"#444"}}>
        <span style={{color:"#059669",fontWeight:700}}>✓</span>{f}
      </div>})}
    </div>
    <div style={{marginTop:16,background:featured?"#6366f1":"#f5f5f5",color:featured?"#fff":"#333",padding:"9px 0",borderRadius:8,textAlign:"center",fontSize:13,fontWeight:590,cursor:"pointer",transition:"all .12s"}}>Choose {planName}</div>
  </div>)`;
    }

    default: {
      return `  return (
    <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fafafa", fontFamily: "system-ui,-apple-system,sans-serif", boxSizing: "border-box" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", textTransform: "uppercase" }}>${componentId}</div>
      <div style={{ marginTop: 8, fontSize: 14, color: "#374151" }}>Configure in property panel</div>
    </div>
  )`;
    }
  }
}

function generateRuntimeSource(): string {
  return `// Forge Runtime v1
// Shared helpers used by Forge code components on the Framer canvas.

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}
`;
}

export const COMPONENT_REGISTRY: ComponentEntry[] = [
  { id: "forge-button", schema: {
    name: "Button", description: "A configurable button", category: "ui",
    props: { variant: { type: "select", label: "Variant", defaultValue: "default", options: [{ label: "Default", value: "default" }, { label: "Outline", value: "outline" }, { label: "Ghost", value: "ghost" }] }, size: { type: "select", label: "Size", defaultValue: "md", options: [{ label: "Small", value: "sm" }, { label: "Medium", value: "md" }, { label: "Large", value: "lg" }] }, label: { type: "string", label: "Label", defaultValue: "Button" }, fullWidth: { type: "boolean", label: "Full width", defaultValue: false } },
    events: { click: { label: "On click" } }, supportsChildren: false,
  }},
  { id: "forge-text", schema: {
    name: "Text", description: "Data-bound text", category: "ui",
    props: { value: { type: "string", label: "Text value" }, variant: { type: "select", label: "Style", defaultValue: "body", options: [{ label: "Body", value: "body" }, { label: "Heading 1", value: "h1" }, { label: "Heading 2", value: "h2" }, { label: "Heading 3", value: "h3" }, { label: "Caption", value: "caption" }] } },
    supportsChildren: false,
  }},
  { id: "forge-input", schema: {
    name: "Input", description: "Text input field", category: "ui",
    props: { placeholder: { type: "string", label: "Placeholder", defaultValue: "Enter value..." }, type: { type: "select", label: "Input type", defaultValue: "text", options: [{ label: "Text", value: "text" }, { label: "Email", value: "email" }, { label: "Password", value: "password" }, { label: "Number", value: "number" }] } },
    events: { change: { label: "On change" } }, supportsChildren: false,
  }},
  { id: "forge-badge", schema: {
    name: "Badge", description: "Status badge", category: "ui",
    props: { variant: { type: "select", label: "Color", defaultValue: "default", options: [{ label: "Default", value: "default" }, { label: "Secondary", value: "secondary" }, { label: "Success", value: "success" }, { label: "Warning", value: "warning" }, { label: "Danger", value: "danger" }] }, label: { type: "string", label: "Label", defaultValue: "Badge" } },
    supportsChildren: false,
  }},
  { id: "forge-avatar", schema: {
    name: "Avatar", description: "User avatar", category: "ui",
    props: { size: { type: "select", label: "Size", defaultValue: "md", options: [{ label: "Small", value: "sm" }, { label: "Medium", value: "md" }, { label: "Large", value: "lg" }] }, imageUrl: { type: "string", label: "Image URL" }, fallback: { type: "string", label: "Fallback initials", defaultValue: "U" } },
    supportsChildren: false,
  }},
  { id: "forge-card", schema: {
    name: "Card", description: "Content container", category: "ui",
    props: { variant: { type: "select", label: "Variant", defaultValue: "default", options: [{ label: "Default", value: "default" }, { label: "Outline", value: "outline" }, { label: "Elevated", value: "elevated" }] }, padding: { type: "number", label: "Padding", defaultValue: 24 } },
    supportsChildren: false,
  }},
  { id: "forge-auth-sign-in", schema: {
    name: "Sign In", description: "Email + password sign in form", category: "auth",
    props: { buttonText: { type: "string", label: "Button text", defaultValue: "Sign In" }, showGoogle: { type: "boolean", label: "Google provider", defaultValue: true }, showGitHub: { type: "boolean", label: "GitHub provider", defaultValue: true }, showApple: { type: "boolean", label: "Apple provider", defaultValue: false }, showMagicLink: { type: "boolean", label: "Magic Link", defaultValue: false }, showRememberMe: { type: "boolean", label: "Remember me", defaultValue: true }, showTerms: { type: "boolean", label: "Terms checkbox", defaultValue: false }, borderRadius: { type: "number", label: "Border radius", defaultValue: 12 }, width: { type: "number", label: "Width", defaultValue: 400 } },
    events: { signin: { label: "On sign in" } }, supportsChildren: false,
  }},
  { id: "forge-auth-sign-up", schema: {
    name: "Sign Up", description: "Registration form with name, email, password", category: "auth",
    props: { buttonText: { type: "string", label: "Button text", defaultValue: "Create Account" }, showGoogle: { type: "boolean", label: "Google provider", defaultValue: true }, showGitHub: { type: "boolean", label: "GitHub provider", defaultValue: true }, showApple: { type: "boolean", label: "Apple provider", defaultValue: false }, showMagicLink: { type: "boolean", label: "Magic Link", defaultValue: false }, showRememberMe: { type: "boolean", label: "Remember me", defaultValue: true }, showTerms: { type: "boolean", label: "Terms checkbox", defaultValue: false }, borderRadius: { type: "number", label: "Border radius", defaultValue: 12 }, width: { type: "number", label: "Width", defaultValue: 400 } },
    events: { signup: { label: "On sign up" } }, supportsChildren: false,
  }},
  { id: "forge-auth-forgot-password", schema: {
    name: "Forgot Password", description: "Send password reset link form", category: "auth",
    props: { buttonText: { type: "string", label: "Button text", defaultValue: "Send Reset Link" }, borderRadius: { type: "number", label: "Border radius", defaultValue: 12 }, width: { type: "number", label: "Width", defaultValue: 400 } },
    events: { sent: { label: "On sent" } }, supportsChildren: false,
  }},
  { id: "forge-auth-reset-password", schema: {
    name: "Reset Password", description: "Set new password form", category: "auth",
    props: { buttonText: { type: "string", label: "Button text", defaultValue: "Reset Password" }, borderRadius: { type: "number", label: "Border radius", defaultValue: 12 }, width: { type: "number", label: "Width", defaultValue: 400 } },
    events: { reset: { label: "On reset" } }, supportsChildren: false,
  }},
  { id: "forge-auth-accept-invite", schema: {
    name: "Accept Invite", description: "Accept team/organization invite form", category: "auth",
    props: { buttonText: { type: "string", label: "Button text", defaultValue: "Accept Invite" }, borderRadius: { type: "number", label: "Border radius", defaultValue: 12 }, width: { type: "number", label: "Width", defaultValue: 400 } },
    events: { accepted: { label: "On accepted" } }, supportsChildren: false,
  }},
  { id: "forge-auth-verify-email", schema: {
    name: "Verify Email", description: "Email verification prompt with resend", category: "auth",
    props: { email: { type: "string", label: "Email to verify" }, borderRadius: { type: "number", label: "Border radius", defaultValue: 12 }, width: { type: "number", label: "Width", defaultValue: 400 } },
    events: { resend: { label: "On resend" } }, supportsChildren: false,
  }},
  { id: "forge-auth-magic-link", schema: {
    name: "Magic Link", description: "Passwordless email magic link form", category: "auth",
    props: { buttonText: { type: "string", label: "Button text", defaultValue: "Send Magic Link" }, borderRadius: { type: "number", label: "Border radius", defaultValue: 12 }, width: { type: "number", label: "Width", defaultValue: 400 } },
    events: { sent: { label: "On sent" } }, supportsChildren: false,
  }},
  { id: "forge-auth-update-password", schema: {
    name: "Update Password", description: "Change current password form", category: "auth",
    props: { buttonText: { type: "string", label: "Button text", defaultValue: "Update Password" }, borderRadius: { type: "number", label: "Border radius", defaultValue: 12 }, width: { type: "number", label: "Width", defaultValue: 400 } },
    events: { updated: { label: "On updated" } }, supportsChildren: false,
  }},
  { id: "forge-user-profile", schema: {
    name: "User Profile", description: "Current user info", category: "auth",
    props: { showAvatar: { type: "boolean", label: "Show avatar", defaultValue: true }, showName: { type: "boolean", label: "Show name", defaultValue: true }, showEmail: { type: "boolean", label: "Show email", defaultValue: false }, layout: { type: "select", label: "Layout", defaultValue: "row", options: [{ label: "Row", value: "row" }, { label: "Column", value: "column" }] } },
    supportsChildren: false,
  }},
  { id: "forge-user-avatar", schema: {
    name: "User Avatar", description: "Current user avatar", category: "auth",
    props: { size: { type: "select", label: "Size", defaultValue: "md", options: [{ label: "Small", value: "sm" }, { label: "Medium", value: "md" }, { label: "Large", value: "lg" }] }, fallback: { type: "string", label: "Fallback initials", defaultValue: "U" } },
    supportsChildren: false,
  }},
  { id: "forge-data-table", schema: {
    name: "Data Table", description: "Tabular data display", category: "data",
    props: { pageSize: { type: "number", label: "Page size", defaultValue: 10 }, tableId: { type: "string", label: "Forge table ID" } },
    supportsChildren: false,
  }},
  { id: "forge-data-card", schema: {
    name: "Data Card", description: "Single record card", category: "data",
    props: { tableId: { type: "string", label: "Forge table ID" }, itemId: { type: "string", label: "Item ID" } },
    supportsChildren: false,
  }},
  { id: "forge-data-list", schema: {
    name: "Data List", description: "Repeatable list", category: "data",
    props: { tableId: { type: "string", label: "Forge table ID" }, template: { type: "select", label: "Template", defaultValue: "list", options: [{ label: "Card", value: "card" }, { label: "List", value: "list" }] } },
    supportsChildren: false,
  }},
  { id: "forge-data-chart", schema: {
    name: "Data Chart", description: "Chart visualization", category: "data",
    props: { chartType: { type: "select", label: "Chart type", defaultValue: "bar", options: [{ label: "Bar", value: "bar" }, { label: "Line", value: "line" }, { label: "Pie", value: "pie" }] }, tableId: { type: "string", label: "Forge table ID" }, showLabels: { type: "boolean", label: "Show labels", defaultValue: true } },
    supportsChildren: false,
  }},
  { id: "forge-payment-button", schema: {
    name: "Payment Button", description: "Trigger payment", category: "payment",
    props: { amount: { type: "number", label: "Amount", defaultValue: 0 }, currency: { type: "string", label: "Currency", defaultValue: "USD" }, label: { type: "string", label: "Button label", defaultValue: "Pay Now" }, variant: { type: "select", label: "Variant", defaultValue: "default", options: [{ label: "Default", value: "default" }, { label: "Outline", value: "outline" }, { label: "Ghost", value: "ghost" }] } },
    events: { success: { label: "Payment success" }, error: { label: "Payment error" } }, supportsChildren: false,
  }},
  { id: "forge-payment-status", schema: {
    name: "Payment Status", description: "Transaction status", category: "payment",
    props: { transactionId: { type: "string", label: "Transaction ID" }, status: { type: "select", label: "Status", defaultValue: "pending", options: [{ label: "Pending", value: "pending" }, { label: "Confirmed", value: "confirmed" }, { label: "Failed", value: "failed" }] } },
    supportsChildren: false,
  }},
  { id: "forge-wallet-connect", schema: {
    name: "Wallet Connect", description: "Connect blockchain wallet", category: "blockchain",
    props: { network: { type: "select", label: "Network", defaultValue: "solana", options: [{ label: "Solana", value: "solana" }, { label: "Ethereum", value: "ethereum" }] }, label: { type: "string", label: "Button label", defaultValue: "Connect Wallet" } },
    events: { wallet_connected: { label: "Wallet connected" } }, supportsChildren: false,
  }},
  { id: "forge-wallet-balance", schema: {
    name: "Wallet Balance", description: "Token balance", category: "blockchain",
    props: { token: { type: "string", label: "Token", defaultValue: "SOL" }, address: { type: "string", label: "Wallet address" }, balance: { type: "number", label: "Balance", defaultValue: 125 } },
    supportsChildren: false,
  }},
  { id: "forge-nft-card", schema: {
    name: "NFT Card", description: "Display an NFT", category: "blockchain",
    props: { nftAddress: { type: "string", label: "NFT collection address" }, tokenId: { type: "string", label: "Token ID" }, name: { type: "string", label: "NFT name", defaultValue: "Cosmic Voyager" }, image: { type: "string", label: "Image URL", defaultValue: "" } },
    supportsChildren: false,
  }},
  { id: "forge-ai-generate", schema: {
    name: "AI Generate", description: "AI text generation", category: "ai",
    props: { prompt: { type: "string", label: "Prompt" }, model: { type: "select", label: "Model", defaultValue: "openai", options: [{ label: "OpenAI", value: "openai" }] } },
    events: { success: { label: "Generated" } }, supportsChildren: false,
  }},
  { id: "forge-file-upload", schema: {
    name: "File Upload", description: "Upload files", category: "storage",
    props: { accept: { type: "string", label: "File types", defaultValue: "*" }, multiple: { type: "boolean", label: "Allow multiple", defaultValue: false }, label: { type: "string", label: "Upload label", defaultValue: "Upload File" } },
    events: { file_uploaded: { label: "File uploaded" } }, supportsChildren: false,
  }},
  { id: "forge-file-preview", schema: {
    name: "File Preview", description: "Preview a file", category: "storage",
    props: { fileUrl: { type: "string", label: "File URL" } },
    supportsChildren: false,
  }},
  { id: "forge-deployment-status", schema: {
    name: "Deployment Status", description: "Deployment status badge", category: "deployment",
    props: { status: { type: "select", label: "Status", defaultValue: "active", options: [{ label: "Active", value: "active" }, { label: "Building", value: "building" }, { label: "Deploying", value: "deploying" }, { label: "Failed", value: "failed" }, { label: "Rolled Back", value: "rolled_back" }, { label: "Pending", value: "pending" }] }, environment: { type: "string", label: "Environment name" } },
    supportsChildren: false,
  }},
  { id: "forge-deployment-metrics", schema: {
    name: "Deployment Metrics", description: "Deployment stats display", category: "deployment",
    props: { activeDeploys: { type: "number", label: "Active deploys", defaultValue: 3 }, totalDeploys: { type: "number", label: "Total deploys", defaultValue: 42 }, uptime: { type: "string", label: "Uptime", defaultValue: "99.9%" } },
    supportsChildren: false,
  }},
  { id: "forge-enterprise-sso-button", schema: {
    name: "SSO Button", description: "SSO provider login button", category: "enterprise",
    props: { provider: { type: "select", label: "Provider", defaultValue: "google", options: [{ label: "Google", value: "google" }, { label: "Microsoft", value: "microsoft" }, { label: "GitHub", value: "github" }, { label: "Apple", value: "apple" }, { label: "SAML", value: "saml" }, { label: "OIDC", value: "oidc" }] }, label: { type: "string", label: "Button label", defaultValue: "Sign in with" } },
    events: { success: { label: "On sign in" } }, supportsChildren: false,
  }},
  { id: "forge-enterprise-compliance-badge", schema: {
    name: "Compliance Badge", description: "Compliance certification indicator", category: "enterprise",
    props: { standard: { type: "select", label: "Standard", defaultValue: "SOC 2", options: [{ label: "SOC 2", value: "SOC 2" }, { label: "HIPAA", value: "HIPAA" }, { label: "GDPR", value: "GDPR" }, { label: "PCI DSS", value: "PCI DSS" }] }, status: { type: "select", label: "Status", defaultValue: "compliant", options: [{ label: "Compliant", value: "compliant" }, { label: "In Progress", value: "in-progress" }, { label: "Non-compliant", value: "non-compliant" }] } },
    supportsChildren: false,
  }},
  { id: "forge-enterprise-role-badge", schema: {
    name: "Role Badge", description: "RBAC role indicator", category: "enterprise",
    props: { role: { type: "string", label: "Role name", defaultValue: "Admin" }, color: { type: "string", label: "Badge color", defaultValue: "#6366f1" } },
    supportsChildren: false,
  }},
  { id: "forge-marketplace-listing-card", schema: {
    name: "Listing Card", description: "Marketplace listing display", category: "marketplace",
    props: { name: { type: "string", label: "Listing name", defaultValue: "Plugin Name" }, tagline: { type: "string", label: "Tagline", defaultValue: "Description" }, category: { type: "string", label: "Category", defaultValue: "connector" }, rating: { type: "number", label: "Rating", defaultValue: 4.5 }, installs: { type: "number", label: "Installs", defaultValue: 1200 } },
    supportsChildren: false,
  }},
  { id: "forge-marketplace-install-button", schema: {
    name: "Install Button", description: "Install from marketplace", category: "marketplace",
    props: { label: { type: "string", label: "Button label", defaultValue: "Install" }, installed: { type: "boolean", label: "Already installed", defaultValue: false } },
    events: { install: { label: "On install" } }, supportsChildren: false,
  }},
  { id: "forge-connector-status", schema: {
    name: "Connector Status", description: "API connector health", category: "connector",
    props: { status: { type: "select", label: "Status", defaultValue: "connected", options: [{ label: "Connected", value: "connected" }, { label: "Error", value: "error" }, { label: "Syncing", value: "syncing" }, { label: "Disconnected", value: "disconnected" }] }, name: { type: "string", label: "Connector name", defaultValue: "API" }, lastSync: { type: "string", label: "Last sync" } },
    supportsChildren: false,
  }},
  { id: "forge-connector-data-card", schema: {
    name: "Connector Data", description: "Display connector data point", category: "connector",
    props: { title: { type: "string", label: "Title", defaultValue: "Data" }, value: { type: "string", label: "Value", defaultValue: "—" }, subtitle: { type: "string", label: "Subtitle" } },
    supportsChildren: false,
  }},
  { id: "forge-ai-chat", schema: {
    name: "AI Chat", description: "Interactive chat interface", category: "ai",
    props: { placeholder: { type: "string", label: "Placeholder", defaultValue: "Type a message..." }, model: { type: "select", label: "Model", defaultValue: "gpt-4", options: [{ label: "GPT-4", value: "gpt-4" }, { label: "Claude 3", value: "claude-3" }, { label: "Gemini", value: "gemini" }] } },
    events: { message: { label: "On send" } }, supportsChildren: false,
  }},
  { id: "forge-ai-agent-chat", schema: {
    name: "AI Agent Chat", description: "Agent chat with memory", category: "ai",
    props: { agentName: { type: "string", label: "Agent name", defaultValue: "Assistant" }, model: { type: "select", label: "Model", defaultValue: "gpt-4", options: [{ label: "GPT-4", value: "gpt-4" }, { label: "Claude 3", value: "claude-3" }, { label: "Gemini", value: "gemini" }] }, memoryEnabled: { type: "boolean", label: "Memory enabled", defaultValue: true } },
    events: { message: { label: "On message" } }, supportsChildren: false,
  }},
  { id: "forge-pricing-table", schema: {
    name: "Pricing Table", description: "Pricing plan display", category: "payment",
    props: { planName: { type: "string", label: "Plan name", defaultValue: "Pro" }, price: { type: "string", label: "Price", defaultValue: "29" }, currency: { type: "string", label: "Currency symbol", defaultValue: "$" }, interval: { type: "select", label: "Interval", defaultValue: "month", options: [{ label: "Monthly", value: "month" }, { label: "Yearly", value: "year" }, { label: "One-time", value: "one-time" }] }, featured: { type: "boolean", label: "Featured plan", defaultValue: false } },
    events: { select: { label: "Plan selected" } }, supportsChildren: false,
  }},
];

export async function generateAllComponents(): Promise<CodeGenResult> {
  const runtimeSource = generateRuntimeSource();
  const runtimeFile = await framer.createCodeFile("forge-runtime", runtimeSource, {
    editViaPlugin: true,
  });

  const componentFiles: Array<{ componentId: string; fileId: string }> = [];

  for (const entry of COMPONENT_REGISTRY) {
    const source = generateInteractiveComponent(entry.id, entry.schema);
    const codeFile = await framer.createCodeFile(
      entry.schema.name.replace(/\s+/g, ""),
      source,
      { editViaPlugin: true }
    );
    componentFiles.push({ componentId: entry.id, fileId: codeFile.id });
  }

  return { runtimeFileId: runtimeFile.id, componentFiles };
}