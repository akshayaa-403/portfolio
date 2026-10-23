/* Project IVY — "The ladder, and who climbs it".
   One request from the demo script followed down IVY's escalation ladder.
   Two authors: a teammate wrote the pipeline, locks, dispatcher, on-call sync
   and timeout handler; this article is about the other half.

   Shared state: whatever the reader types into "Ask IVY something" lives in
   ASK, and every rung widget re-evaluates it. KB is the local knowledge base
   as shipped: intent names, categories and token sets only — no utterances,
   no responses (see the caption under the matcher for what was withheld). */
(function () {
  'use strict';

  var KB = {"cats":["Password & Auth","HR & Payroll","Software & Access","Bot & Session","Other IT","VDI & Virtual Desktop","Jira & Tickets","Laptop & Hardware","Device Enrollment","VPN & Network","Outlook & Email","Slack","InnovyQ Pass"],"vocab":"1password 1st 2fa 365 401 401k 404 500 5th 6th 7th aabout aacess aar able abm about aboutbotkbs aboutbotllm aboutbotversion absence acceptable accepted accesible access accessdeniederror accessforcamtasia accessible accessing accessories accesstoopsgenie accident accomodations account accounts accunt accuracy accurate acquire acrobat action activate activating activation activationofwindows11onvdi active activedirectorytasks adam adamaccpswdreset adapter add addco added adding additionally addlegalname addprinter address addresses addusers addzoompluginboxer adhere adjust adjusttimezonesettings adm admaccount admin administration administrative administrator adminstartor adobe adp advertise advise affecting after afternoon again age agent agiloft agreement agreements air airpods airwatch airwatchabm airwatchduo akamai alert alertmanager alerts alias all allego allow allowed allows almost alpha already also alto amazon amex android annot annual annyone another answers antivirus antivirusforvm any anybody anymore anyone anything api app appear appearing apple appleidforinnovyq applicable application applicationlicenses applicationonboarding applications apply applyleave appointment appreciated approval approve approved approvers apps apttus archival archive archived archiving around arrange articles artifactory ask asking asofnow asset assets assign assignation assigned assignment assist assistance associated asssets athena athenarelatedqueries atlanta atlas atlassian atp attached attachment attempt attempting attenstation audio auth authenticate authenticating authentication authenticator authenticators authorized auto autocreateticket automate automated automatic automatically aux availabale availability available away aws awsaccess awsaccount awsmigrationrequest azure back backdoor background backgrounds bad badge badges balance balances bangalore bank banking bar base based battery because become been before begin behavior being below benefit benefits bengaluru best better bifrost bifrostenvironmentissues billing bios birth bitfrost bitlocker black blinking block blocked blue bluescreen bluetooth bluetoothissue boarding book booked booking bookings boot bootcamp borders born bot bought bounced box boxer boxerenrollmentmethods branch brand branded branding bring broadly broken browser bsod bsodscreen buffering build building builds built bulgaria businees business businesssales but button buy buyback buying bye bynder byod cable cables cage calculated calendar call called calls camera camtasia cancel candidate candidatereferral capabilities car card cards care career carrer carried cart carta cartaapplicationissues case catalog center cert certificate certification certified chain change changed changes changing channel channels charger chart chat chatbot check checked checking checkleavebalance child choice chrome cisco claim clari classic claude clear cli click clicker client clm clone close closing cloud clouddevops clouddevopsmore code collaborate colleague collegaue color com come coming command commands comments commerce commerceportal commission common communication community comp companion company compare compared compensation complete completed completely compliance compliant compueter computer concern concerns concur concurrelatedqueries conducting confidential config configuration configurationmaximus configure configuring confirm confluence confluencejiraissue conga congaissue connect connected connecting connection console consuming contact contacting contains content continually continue contract contractor contractors contribute contributed contributing contribution contributions controller conversation conversations conversion convert converting convo copilot copyright core coreiconchange cork corp corporate correct corrected correctly costa could couldn countries country couple course courses coverage cpq cpu crash crashed crashes crashing create created createjiraticket creating creation credential credentials credit credited credits crowdstrike csp current currently cursor cursorlicense cushions custom customer customerconnectqueries customers customersecurity customize customs cutoff cypress daily dashboard dashboards data database datacenter datacenterrelatedqueries date dates day daycare days deactivate deactivated deactivating dead deadline deal debug declaration declare decommission decrease decrypt dedicated deducted deduction define defined delacaration delegate delete deletezoommtngoutlook deletion deliver dell dem demanding demappvolumelicense demo demonstartes denied dental deny dep dependent depletes deploy deployed deploying deployment deposit deposits depot describe designing designproductivityln desk desktop despite details detected dev developer development device devicedeclarationform deviceenrollmenterror devices devtools diagnose did didn different digit digital direct directions directory directorytask disable disabled disappeared disconnecting discuss dismissed display distribution distributionlistdl disturbing dns dnsrelatedrequest doc docker dockerupdate docs document documentation documents docusign does doesn domain don dongle dont door down download draft drive drivers drop dropdowns dual due duo duos duration during dvd dying dynamic earlier early earning easier edit editing effectively eloqua else email emailalias emailretentionpolicy emails emergency employee employees employer employment empolyee empty enable enabled encrypted encryption end endconversation ending eng engage engineering enhancements enough enroll enrolled enrolling enrollment ensure enter entered entering enterprise entirely entitled entitlement entra entries entry environment environments eor eps equipment erp error errors errror escalate escalation especially ess establish esx etc euc evaluation even evening every everytime excel exception existing exit expected expense expenses expensesandinsurance expired expires expiry explain extend extended extending extension external externalpeopleindl eyes fabric facing failed failing fails failure failures falcon fallbackintent falling fan fast fault fax feature features feedback fetch fetching few fidelity field figma file files filezilla filezillaaccess fill filled filling filter finance find fine fingerprint first fix flickering flight floor folder folders folks follow following font fonts force forgot forgotten form form13 form16 former fossa found foxit frequently fresh friend fsa fte full fully functionalities functionality functioning functions fusion gain gaining game gatekeeper gatekeeperrelatedqueries gateway gbt gcp general gets gid github githubaccess githubcopilot githubrelatedissues give gives giving global goes going gone good google googlecloudaccess got gotten govt grab grafana grafanaaccess grant granted graphics greeting greetings grid grounds group gsconnectaccess guess guest guests guidance guide guidelines guides hackerrank had hand handle handled handles handling handover hangs happened happens hard hardware havent having hdmi headphone headphoneissues headphones headset headsets headsetserialnumber health healthequity heard heat heated heating heats hello helping hence hep here hey high him hire hires hiring his hit holder holiday holidaycalender holidays home homepage horizon hospital host hosted hosting hostzoommeeting hot hotel hour hours house howdy however hrquerries hrsupport hsa hsas hsbc hsbcqueries http https hub huge iam icon ide identify identity idf ids iid image images imagetroubleshoot impersonate impersonation imposes improved improvements inbox incase includes including incoming incorrect increase india indian indicates industry info information informs infra initiate initiation initiative innovyq innovyqemployeeportal innovyqform16 innovyqinside innovyqpopup innovyqvdipassword input inquire inside insiders install installation installed installer installing instance instead instructions insurance integrate integration intellectual intelligence intelligent intent interact interaction interactive interim internal internaljobportal internally internet interop interoperability interopmatrix interoptool interview interviews into intune invalid invite inviting involuntary involved ios ipad ipados iphone ireland isn issu issued itassetsassignedinmyname itemized items its ivvy ivvybot jabra japan japser jasper java jenkins jetbrain jetbrains jfrog jira job jobs join joined joinee joiner joining jun just keep keeps key keyboard keyboards kibana kicks kind kindly kinldy know knowledge lab lag lagging landing language laptop laptops large last lateral latest launch launched learn learning leave leaves leaving left legacy legal let letter letters libraries license licenses licensing lightning like limit line lines link links linux liquid liquidspace list listed live llm loa load loading loaner loanerlaptop local locally located location lock locked log logengine logged logging login loginissue logon logz logzio loki lokiaccess long longer look looking looks loosing lost lot loud mac macbook machine maconrisk macos macro macros made mail mailbox mails make makes making malfunctions manage managed management manager managers manual manually many mapped mapping mark master match maximums may mean medical meet meeting meetings mega member members memory merchandise message messages method methods metrics mfa mftserverwebaccess mic microphone microsoft microsoftauthenticatorreset microsoftsuite migrate migrated migrating migration min mine mins minutes missed missing mitigation mobile mode model modify money mongo mongodb monitor monitors month monthly months more morning mountain mouse move moved msdn msengage msft msi msp msproject msteamaccess much multi multiple name narchive navigation nda needed needs net netherlands network never new newhire newhireitsupport newlaptoprequest newsupplier next nexus noc node noise nominee non nopower normal note notepad notice notification notifications notifying nov november now ntp number numeric o365 oasis object observed obtain occurred oci ocp off offboard offboarding offer office office365 offices official officials offline often oic old older omni omniofficeworldwidelocationsaddressescontactnum omnsb onboard onboarded onboarding one onedrive onedrivesignin ongoing online only ooo open opening openings openshift opentext openvpn opportunity ops opsgenie option options oracle oracleerp oracleoicaccessrequest oracleoicatpdbaccessrequest order ordering org organization organizational organize origami other others otter otterai our out outbox outfit outlook outofofficeemail outside over overheating overpayment own owned owner ownership paas package packaged pad page pagerduty pagerdutyaccess palo park part particular partner party pass passcode password passwordmanagers passwords pat patent paternity pay payeeweb payroll payslip payslipissue pcq pdf pdu pen pending people per perfect perform performance performing perimeter period peripherals permission permissions permitted perpetual person personal phishing phone phones picture pilot pin ping pixels place plan planning plans platform play pls plugin point policies policy poor pop popping popup port portal position possible post postal postman power powering powers powerstore powersupply ppo prefer preferably preferred premium prerequisite presentations presenter previous prices primary print printer printers printing printout prior prism privacy privacyscreens private privileges pro problems procedure proceed process processed procure procured prod product products professional profile program project projects prometheus promethus promethusaccess prompting prompts proper properly property proprietary protect protection provide provided provider providing proving provision provisioned psc public publish pull purchase purchases purpose push pushing pycharm python quarantine queries query question questionnaire questions quickly quite quota rack rails raise raised raising ram randomly raw reach reached read reader realizer really rear reason reasoning reassigning receipt receive received receives receiving recent recently reception recieved recipients recommended reconnect record recording recordings records recovering recovery recruiting refer referral reflect reflected refresh refreshed refunds refurbished regain regarding register registration regulatory reimburse reimbursement related release released relocating rely remaining remember reminders reminds remote remotely removal remove removing rename renaming renew renewal renewed rental repair replace replaced replacement replacing replies reply report reporter reporting reportphishing reports repository req reques request requestaccess2 requestaccess3 requested requesting requests requesttoolaccess1 require required requirement requirements requires requisition requisitions reserve reset resetting resign resignation resigned resigning resolution resolve resolved resolving resource resources responding response responses responsibility responsible rest restart restarting restricted restriction restrictions resume retain retention retrieve retrieving return returning review revoke revops ribbon rica right rights risk risks role roles root roth route rovo rules run running runs saas saaswatch said salary sales salesforce salesforceissues same saml sandbox sap saying says scan scanner scattered schedule scheduled schengen scim screen screens screenshot screensteps sdfc search second secondary secondarylaptop secrets section secure security see seeing seem seemplicity seems selecting self send senders sending sensitive sent serial server servers service servicerequest services session sessions set setting settings setup several sfdc sftp sftpqueries shall share shared sharedmailbox sharepoint sharing sheets shift shot should show showing shows sign signature signatures signed signin signup similar sin since single singup site skybridge slack slackchannelrename slak slot slow slowness smart smartsheet smime snagit snap sofia software solid solution solve some somebody someone sonar sonarcqube sonarqube sound source sources sow space spaces spam spammed speak speakers specific specifically spin spines spinned splash split spoc sql sqltraceaccess square srs ssd ssl sso stack staging standards standing start started starter static station status stays step steps stg still stolen stop stoped stopped store stuck studio stylus sub subfolders subject submission submissions submit submitted submitting subscription such suggest suggestions suited summary super suport supplier support supported supports supposed sure surrender suspect suspicious swag switch switches switching sync system systemissues tab table tableau tableauaccess tablet tag take talk tam target task taskbar tasks tax taxes teach team teams tech technical tell telling template templates temporary tenant tenants teradici terminal terminate termination terms territory test testbeds testdrive testgrid testing testrail text than thank thanks thankyou their then there these they thinapp things think third though through throwing thrown thru thunderbird ticket ticketing tickets tile time timed timeline timesheet timezone timing title today token tokyo told too took tool toolkit tools top touch tourist trace track trademark trained training trainings transactions transfer transferring travel trellix trello tri tried trigger trouble troubleshoot troubleshooting trust try trying turbotax turn turned tutorials twice two tyia type types uat ubuntu uem unabletologinmac unarchive unavailability under understand undo unenroll unexpected unlock unlocked unlocking unmanaged unresponsive unstable unsure until update updated updating upgrade upgraded upgrading upload uploading urgent url usa usage usb use used useful user username users uses using usual utilisation utilize utterances vacancies vacation validate value varicent vault vcd vcenter vcloud vdi vendor verification verified verify version vertical very vetted via video videos view views virtual visa visibility visible vision visit visiting visitor vista visual visuals vms vmware voice volume volumes voluntary vpn vscode vsphere vsphereorvcloudissues vsrc waiting walk walkthroughs wanted wants warranty watch watermark way ways web webcam webhooks website week weekend wehoo welcome well west wework wfh whats whenever wher where whereismyorder whether which while white who whom wierd wifi will win11 windows wipe wireless wispr wispraccess withdraw withdrawal within without wiz won wont word work workday workdayhr workdaylocation worked worker workflow working workingaccess workplace works workspace workspaceone workspaceoneaccess workstation workstreams worn would write wrong www year years yes yet yml yourself youtube zero zoom zoomaicompanion zoomin zoominfo zoomissues zoomphonenumber","rows":[["ADAMaccPswdReset",0,"x.1b.1c.1s.4t.8q.9t.gs.ll.p4.yf.zp.118.16h.185.18r.18s.18x.196.19b"],["ADMaccount",0,"o.x.15.1s.1t.4t.ce.ci.ck.h3.nj.p4.px.rj.t8.wh.y9.zp.10w.120.162.16b.1e1.1e4"],["ADP_issues",1,"o.1l.20.39.3m.4e.59.8q.90.92.9t.c0.d5.dn.g4.gs.hu.i0.i6.jv.n4.n8.o3.or.q7.s3.sk.t4.t8.th.wh.ys.ze.zp.zx.zy.10w.118.11a.13v.146.14d.15u.16h.18r.19j.19k.19s.1ar.1by.1d3.1eb.1eu.1fx.1i5.1ia.1j5.1jd.1jh.1jk.1kd.1km"],["AWSMigrationRequest",2,"o.x.y.1l.1w.1x.23.2m.32.49.4d.4f.5b.5e.6b.8q.ab.b4.ds.dy.f5.fw.gr.gs.ii.k6.kp.lr.ma.md.nd.o6.qd.rj.tf.u5.uo.v4.v5.v6.v7.wh.xz.yo.z8.z9.zj.10f.10i.10t.111.124.127.129.144.162.167.16r.16w.17h.17l.17m.19e.19s.1al.1ar.1bw.1co.1d9.1dj.1ed.1fb.1fk.1fl.1gs.1h1.1h6.1iw.1jj.1jw.1jx"],["AWSaccount",2,"e.o.x.y.1e.3c.5b.5c.5d.8j.9j.fz.hv.i0.jv.kl.o4.p4.pq.rj.sg.tg.up.v7.wh.y6.yx.118.127.12w.13q.13w.15e.15f.162.17w.18r.19e.1al.1ap.1b5.1dj.1ee.1ef.1eq.1et.1i0.1i5.1ij.1jd.1kj"],["AWS related queries",2,"e.o.5b.d8.fm.hc.ml.nl.nm.sy.ub.12d.13f.153.162.1al.1gq.1ho.1jg"],["AboutBotKBs",3,"h.o.33.42.5t.5u.6x.9u.a7.ft.fu.fw.m6.oy.px.ri.rl.rm.ss.xm.14o.157.16s.18r.199.1ax.1co.1cq.1dn.1fg.1h3.1h8.1jd"],["AboutBotLLM",3,"i.10.3i.67.6x.8z.a8.bk.cr.d7.eg.fw.gp.mb.pt.ri.rr.ru.s0.ss.vh.w5.xz.y6.yt.11g.12t.13f.143.18p.199.1aw.1c3.1cj.1co.1df.1dy.1h3.1ha.1ht.1jg"],["AboutBotVersion",3,"j.11.1g.5y.5z.68.6x.a9.c1.f5.gj.hd.je.ok.ol.pk.tv.u0.vr.wh.x3.xi.xr.z3.109.11r.199.19s.1e7.1h3.1ht"],["About_Bot_Capabilities",4,"g.36.4d.6x.87.gm.n4.ri.tz.xi.ys.12w.198.19s.1ao.1co.1h3.1h5.1k2"],["AccessDeniedError",2,"e.o.p.3u.4u.63.b9.e9.ex.hg.hz.i0.k7.p4.q7.t8.us.yh.z7.149.19f.1al.1k3"],["AccessforCamtasia",2,"o.q.39.83.sc.sd.sk.xb.12w.13p.166.17k.19j.1al.1dj.1fx.1jj"],["AccesstoOpsgenie",2,"o.u.ye.1al"],["Access to PCQ",2,"o.x.t4.100.1al.1ha.1jh"],["Access to [internal host]",2,"o.2z.36.42.9t.e9.lb.o3.p4.tl.10e.1al.1bg.1es"],["Access to [device-management host]",2,"o.2e.39.9t.ay.b0.c0.cj.ck.io.k7.sy.zp.12w.16h.1al.1g9.1h3.1ij"],["ActivationOfWindows11OnVDI",5,"e.15.16.17.18.eq.jz.129.1ho.1i2.1iv.1jp"],["ActiveDirectoryTasks",4,"19.1a.1b.1e.91.ce.cf.ci.dz.fa.fb.ly.th.up.w7.wh.ys.105.12r.15f.18q.1d9.1f6"],["AddCo-hostZoomMeeting",2,"o.1e.1f.24.ch.nl.no.qa.ul.1al.1kv"],["AddLegalName",4,"1j.8q.s7.w7.ys.129.13p.1eq.1h3.1jd"],["AddPrinter",4,"9.a.1e.1h.1k.9s.ah.ao.ar.as.bb.ex.fo.fu.k2.ko.m4.o9.p4.pe.pl.rs.to.tp.ul.wh.ys.yx.11u.11v.11w.11x.11y.18p.19b.19c.19d.19k.1ap.1bw.1d1.1d9.1el.1h3.1ha.1ia.1k9"],["AddZoomPluginBoxer",2,"o.1e.1o.3c.71.fx.h3.i0.z0.10z.19s.1al.1fx.1kv"],["Addusers-sharedmailbox",4,"1e.1n.m4.tx.ys.z0.19l.19m.1ar.1h6.1h8"],["AdjustTimezoneSettings",4,"1q.1r.rs.ys.19b.1bw.1eu.1ey"],["General Ticket Creation",0,"o.1u.4t.ah.ci.l4.rs.zp.162.19b.1eq.1g9.1jp"],["Admin portal Access & Issues",0,"o.s.1u.4t.8q.b4.cw.oh.oy.sg.zp.118.11t.162.169.1cl.1eb.1gq.1h6.1jh.1kj"],["Adobe License",2,"e.o.13.14.1z.2p.36.3i.3q.3r.3s.4a.4z.bv.g4.go.io.jv.kj.pe.pf.rl.rs.s8.sc.sg.ys.yx.101.129.13p.13v.13y.14f.162.166.169.16a.18y.19s.19y.1al.1cg.1eh.1ht.1jd.1jj.1k2.1kj"],["Adobe Sign license",2,"o.1z.m4.sc.129.19w.1a3.1al"],["AirwatchDUO",4,"o.2e.2g.97.ex.gc.qe.ys.13p.162.19e.1jd"],["Akamai portal access",2,"o.2h.118.13p.162.1al.1jd"],["AntivirusforVM",4,"1e.34.35.90.g4.pe.ys.12v.1an.1bw.1jd"],["AppleIDforInnovyQ",4,"e.3f.3g.4d.4e.ce.ck.p4.t7.tw.xm.ys.1ar.1ha.1jh.1k2"],["Excel or Outlook issues after device wipe",4,"e.o.24.3i.3l.3u.ex.f3.ig.jz.kl.pe.pf.x7.xj.ys.z0.1c2.1d1.1jq.1k9"],["ApplicationLicenses",2,"e.o.x.1g.1u.26.2c.2u.3c.3i.3j.44.4e.7e.7l.7m.7z.9m.9n.9t.ay.bp.c0.c8.cp.cr.cw.dm.eo.f1.i0.j5.ki.kz.l7.lb.lr.nj.o2.o3.p4.pj.q7.rj.rz.sc.sf.sg.t7.t8.tb.tc.tl.u3.ue.v3.ve.w7.wh.x3.yq.zk.zp.10f.10u.10v.118.12d.12i.12j.12w.13q.14w.162.166.16s.17d.17j.17k.17z.19e.19g.1ag.1al.1ar.1as.1au.1bj.1bk.1bo.1bq.1c5.1d5.1db.1dj.1el.1eo.1g9.1gq.1h4.1h7.1ib.1iu.1jd.1jg.1jk.1jy.1ke.1kh.1kj"],["ApplyLeave",1,"20.3m.3n.i0.ld.ot.s2.s3.x3.zx.1dj.1jd"],["Appointment_Booking",4,"3o.4e.5p.6p.6r.b4.bt.p4.qq.rl.uh.xj.ys.10i.110.1co.1h0"],["Artifactory access",2,"o.43.jy.13p.1al.1eu.1jd"],["IvvY Depot Requesting laptop and peripherals for new hire employee",4,"48.b4.el.gx.gy.mr.n8.n9.qq.r7.rf.rs.rt.ti.to.uo.vn.vu.wh.xx.yl.ys.10d.13p.14a.162.166.19s.1dj.1jd.1jk"],["Athena access issue",2,"o.4h.13p.162.19j.1al.1jd.1jj"],["AthenaRelatedQueries",4,"o.4h.4i.84.90.at.c0.cr.xz.ys.12j.1co.1eq.1es"],["Atlassian, Confluence and Jira",6,"o.4l.au.c0.d5.r1.ze.123.12j.12w.162.166.171.17p.1el.1es"],["AutoCreateTicket",6,"51.55.ce.r1.13p.1eq.1es"],["Azure subscription request",4,"o.x.5f.ys.162.16a.1cf"],["BSODScreen",7,"6l.7b.7c.7u.9o.b0.i0.lf.mj.mm.px.rs.u5.uq.18e.1c0.1fz.1hy"],["BifrostEnvironmentIssues",4,"7.2s.5u.69.6a.73.7e.7g.7m.9o.9t.ay.ce.g3.hu.i0.i1.j2.jd.nc.o3.ys.12j.16t.16u.17a.19e.1b7.1b9.1em.1fx.1hh.1jh.1k9"],["BluetoothIssue",7,"e.1i.24.36.3p.4b.4d.4e.4s.6h.6k.6m.6n.7d.7m.ag.ah.ay.b1.c0.e3.ex.fe.ff.fw.fx.fz.g0.g7.i9.ie.j0.ks.lh.ll.mg.mj.ml.mn.mp.mq.pk.ra.rc.rs.tk.tl.tp.v0.vs.wh.yf.ys.yx.10x.113.13t.14g.16z.170.18t.18v.19c.19d.19u.1am.1ap.1ar.1bu.1c1.1de.1dj.1eu.1fq.1gs.1gv.1hx.1hy.1if.1j2.1j6.1jb.1k9.1kj.1kt.1kv"],["Booking 3.0",4,"o.3i.6r.jz.ys.13v.19s.1jk"],["Bot_Interaction_Guide",4,"11.4d.67.6x.em.gp.ir.m4.oy.pt.pu.tz.ys.12w.19s.1cs.1dn.1ge.1h3.1iw"],["BoxerEnrollmentMethods",8,"o.1e.3c.3i.71.72.ar.ex.gs.hi.i9.n0.pe.qe.vf.wh.zn.10l.19c.19e.1h3"],["InnovyQForm16",1,"f4.gs.jv.kd.mk.om.p4.p6.tf.vd.zx.10j.146.147.1by.1dj.1gp.1io.1jn.1kq"],["Bynder access request",2,"o.7s.13p.162.19s.1al.1ar.1jd"],["CLI portal",4,"o.4t.9d.9t.o3.p4.sg.ys.zl.118.129"],["CandidateReferral",1,"85.86.cq.gx.p4.r2.rl.s8.zx.107.129.14o.14p.17k.19s.1ar.1bw"],["CartaApplicationIssues",4,"o.3c.3i.4x.8g.8h.jl.jz.ys.13v.19b.19s.1ar.1jk"],["CheckLeaveBalance",1,"5n.5o.93.df.i0.jz.s2.ua.zx.158.1i0.1jd"],["Clari access",2,"o.22.2m.99.ex.hg.i9.o4.op.sg.u1.yg.162.166.1al.1cs.1fq.1kj"],["Close_convo_with_feedback",3,"6x.9j.bo.jf.199.1he"],["CommercePortal",4,"o.1e.3c.4t.9t.9z.a0.c0.kw.lr.ly.o3.p4.rj.rl.s8.xe.y4.ys.118.12w.13p.13x.162.1dj.1g7.1h6.1jd"],["Omni",4,"a4.b4.xt.ys.110.118.15u.19j.1ed.1jd.1jj"],["ConcurRelatedQueries & AMEX",4,"e.o.w.2c.2x.36.3a.3c.3t.4d.4e.5g.6p.6q.6z.7j.7m.88.89.98.ak.al.ay.b4.bv.cl.de.dw.fz.i0.il.im.jv.k1.kq.l2.ml.nq.p4.q7.qn.t7.t8.ta.ti.to.u4.vf.x5.xz.yf.yl.ys.10y.11s.12w.12z.13f.13p.145.152.153.15m.15u.15y.16o.184.18r.18s.1ar.1c7.1cc.1co.1dj.1e9.1ed.1el.1eq.1f4.1f7.1fm.1fx.1g5.1hx.1is.1iw.1j1.1jd.1jn.1k8.1kd"],["ConfluenceJiraIssue",6,"o.au.av.c0.gn.hx.r1.rj.tz.z8.ze.12j.12w.15v.171.1az.1es.1kd"],["CongaIssue",4,"o.2a.2b.3i.3v.9h.aw.ax.ch.d7.fu.g1.j0.jz.lb.xo.ys.13v.14e.14h.162.17z.19g.19s.19w.1ar.1d3.1gw.1jd.1jk"],["Copilot",4,"3.o.x.3h.90.bp.c0.gs.h3.l7.rj.sc.sh.v1.vp.x7.ys.z0.10o.11n.15u.162.1d1.1dj"],["CreateJiraTicket",6,"cg.r1.1es.1he"],["Crowdstrike",4,"o.28.39.b3.c9.co.i0.j6.jm.rc.rs.sk.th.tm.wy.ys.114.115.12w.13e.13p.13t.19j.1c0.1jj.1jo"],["CursorLicense",2,"o.x.cn.cs.ct.ew.hn.o8.sc.162.1al.1ch.1dj.1f7.1h6"],["CustomerConnectQueries",4,"e.o.x.ay.cw.cx.hq.kp.lb.oi.p4.px.sk.x3.ys.118.129.1h8.1ja"],["CustomerSecurity",4,"cz.p4.ys.12e.13j.18q"],["DEMAppVolumelicense",2,"o.s.3c.3i.96.cf.e4.e6.gi.hu.i0.jd.lj.nj.op.p4.pc.rd.rn.sc.sd.u6.w0.zc.1al.1ha.1ho.1ig.1ih"],["DNSRelatedRequest",9,"b4.ce.fm.fn.fy.p4.uc.wf.123.126.13p.14y.162.16n.16x.18s.19s.1co.1dj.1ij.1jg.1jj"],["DatacenterRelatedQueries",4,"8.n.1e.3r.4o.6c.6v.7u.7w.97.ar.d7.d9.da.e3.g2.i8.iz.jb.k2.k7.ob.p0.p4.q7.u2.u5.vf.vv.w6.wh.wn.yl.ys.102.11h.11i.12x.133.13n.141.15w.17u.18e.18p.194.195.19b.19c.19l.19r.1ak.1b8.1cy.1gq.1h0"],["DeleteZoomMtngOutlook",10,"7y.84.dz.e0.gs.ul.z0.15f.1gf.1kv"],["DeviceDeclarationForm",4,"4n.c0.cv.d1.dn.do.dx.es.ex.ey.hy.kd.lb.ou.rs.s9.ys.127.162.166.169.1fm.1jc.1k2"],["DeviceEnrollmentError",8,"ex.ez.hh.hi.i0.jz.ki.l5.nb.p4.t7.tw.10a.16o.1h6.1ha.1jh.1jq"],["Device enrollment methods",8,"15.2n.2y.3c.7t.80.8r.c0.ex.g4.hc.hf.hh.hi.m6.o4.oe.p4.pe.pr.qf.qg.qh.ra.rs.s1.to.uu.uv.wh.xz.10l.166.19b.19e.19l.1bo.1di.1ha.1ho.1jp.1kd.1ke"],["Disable Bitlocker key for windows machine",4,"6f.6t.7m.dr.ex.fc.ga.h5.rd.tq.ys.14m.15f.1bw.1jp"],["DistributionListDL",4,"1e.1h.2m.8q.9t.c0.ch.fj.fk.gn.hc.i0.p4.sp.up.vi.ys.z0.zj.129.166.19k.1bw.1dj.1g9.1gq.1jh"],["DockerUpdate",4,"e.o.x.12.36.3c.45.4b.5y.7f.eq.ew.fp.fq.gs.hc.hp.i0.j0.jw.jz.kz.m8.n1.of.p4.qk.qp.ri.sc.sz.t8.th.to.tw.y6.ys.11b.12z.139.13g.14b.14x.153.162.165.186.18r.19w.1a0.1ao.1ar.1bp.1dj.1fw.1gq.1gr.1gt.1h1.1h3.1ha.1ho.1jb.1jd.1jx"],["Edit Name on Slack",11,"3e.8r.gn.w7.129.12r.1a9"],["EmailAlias",10,"1g.1l.2l.c0.ce.cf.ci.es.gs.gt.ml.sk.tw.z0.12w.13p.162.19k.19s.1jd"],["EmailRetentionPolicy",10,"49.70.f5.fd.gs.gu.gv.os.tw.tx.vi.vq.z0.112.162.175.176.19u.1d8.1gq.1gr.1kn"],["Employment Verification letter",1,"1l.20.3a.gx.h0.s9.th.zx.129.162.18s.1ar.1dj.1gy.1hq.1jd.1kj"],["EndConversation",3,"6x.7r.8y.9j.bj.h7.h8.vr.wb.13g.16p.199.1e9.1ea.1kp"],["End user device security policy",4,"g.ex.h7.p3.rl.ys.112.18q.1fv.1h6.1ku"],["Excel Macros not working",4,"90.ce.h3.i1.ig.jz.tt.tu.ys.126.19d.19p.1ao.1k9"],["Exit_Hardware_Return",4,"1.22.24.36.48.4g.5g.5p.66.a7.at.ba.dd.f0.g8.gs.gx.h9.hy.ij.k6.lb.ll.m4.me.mj.n0.p4.ql.qo.qq.rl.rs.rv.s4.si.sp.vo.wh.wv.wx.x1.xb.xf.xh.xr.xs.xz.yn.ys.z3.zj.10c.10y.127.129.12x.16k.16l.16y.179.17a.192.19s.1a4.1ar.1bw.1c9.1ce.1ct.1dj.1ed.1f1.1fz.1gd.1ir.1jd.1k2.1k9.1kj"],["ExpensesandInsurance",4,"e.o.1e.30.6w.8a.90.94.98.c0.c7.ea.es.gx.hi.in.jv.mt.ot.oy.p4.pm.rl.s8.uj.wd.wh.wr.y3.ys.10t.118.129.151.152.1cc.1co.1dj.1gq.1i6.1jd"],["Expired laptop warranty",7,"bw.df.io.ip.is.ji.mj.rs.wh.xz.ym.yx.129.13q.162.19j.19s.1a4.1it.1jd"],["Extend Zoom Mins",2,"e.o.7z.fz.h4.hn.is.jd.ml.nr.sc.ul.um.v8.va.vb.vr.y4.z3.10f.14h.14i.19a.1al.1dj.1e7.1eu.1hz.1jh.1kv"],["ExternalPeopleInDL",4,"e.1e.1m.ce.fj.gs.hl.iw.ix.p4.px.sp.ws.xk.yp.ys.105.1ed.1h8.1iw.1jd"],["FOSSA related issues",4,"31.36.3b.3i.4r.ao.ap.c0.d5.ii.j0.k6.kh.m4.oj.rd.t8.u6.ys.zb.ze.129.12k.13d.153.172.1fq.1h4.1kk.1kr"],["FallbackIntent",4,"j7.ys.1he"],["Fax Machine",4,"jc.jv.tq.xj.ys.1h0.1jd"],["FilezillaAccess",2,"o.3c.59.78.c0.jo.jp.o4.pe.pr.ra.tv.vr.132.1al.1el"],["Form16",1,"o.4d.4e.jh.kd.kf.rj.sa.sg.xb.zx.12w.177.178.1jd.1kj"],["Fusion and Workstation access",2,"o.3i.g4.kv.pe.13p.162.1al.1ie.1jd.1kg"],["GSconnectAccess",2,"o.2w.7z.9r.ay.lz.sq.yx.13v.162.19s.1al.1jk"],["GatekeeperRelatedQueries",4,"o.84.kz.l0.ys.162.1jd"],["GithubAccess",2,"o.ay.i0.l7.l8.q7.t7.t8.14w.162.1al"],["GithubCoPilot",2,"o.bp.h3.l7.l9.sc.1al"],["Github Desktop installation",2,"o.eq.l7.pf.sk.sm.to.1al.1jp"],["GithubRelatedIssues",2,"6.e.o.36.39.63.7m.9i.9y.e9.gs.i0.iw.kb.l6.l7.la.ld.ll.ls.ml.n4.o4.oa.t6.ts.u4.us.x3.yx.zp.zs.12y.135.136.15z.162.17c.17g.19v.1al.1fs.1fw.1k8.1kk"],["Global Protect setup on a Linux machine",9,"ar.ay.le.pe.pf.sm.tq.wf.12u.19e.1g8.1ij"],["GoogleCloudAccess",2,"o.x.ce.l3.lk.wh.12j.15g.162.1al"],["GrafanaAccess",2,"o.2j.2k.7x.d5.d6.hc.lp.lq.pn.uw.v4.xd.12l.13u.162.166.18y.1al"],["greeting",3,"25.39.4e.6x.c0.id.lg.li.lu.lv.n0.n5.nu.ti.vs.10q.18r.199.1ap.1ar.1co.1dj.1ed.1h3"],["HRQuerries",1,"e.o.x.y.19.1l.36.39.4e.63.64.6d.89.9o.bw.db.dg.di.ej.f8.gs.hf.i0.i6.io.jy.m4.mt.mv.n0.nh.nw.ny.or.oy.pa.pm.rd.rj.s5.s6.sg.sk.t8.vc.wm.xz.yo.zp.zx.118.147.16h.19l.1ar.1bw.1by.1cb.1ch.1dg.1dj.1dr.1el.1eu.1fa.1h6.1h8.1ie.1jj.1jn.1k9.1kj"],["HRsupport",1,"1l.7m.9q.a7.cq.cr.gs.gx.kg.km.n8.nx.p4.rj.tg.wh.wi.z2.zx.12w.134.18y.1cm.1co.1ed.1eq.1fx.1h3.1k9"],["HSA-FSA-401",1,"4.5.e.g.o.x.1l.36.4d.58.5h.5w.5y.62.7m.80.89.8b.8q.95.b9.bd.be.bf.bg.bh.bx.ce.du.e5.ed.ek.er.f3.fj.fw.fz.gb.gs.hg.ik.js.jv.kd.kn.kw.lb.mu.n4.ny.nz.or.p4.pb.pz.rv.s6.tv.tz.u3.uf.un.v9.x3.xr.y2.yw.yx.z5.zx.10t.11a.11j.12y.13v.14u.14x.152.153.162.17n.18r.18t.19s.1b3.1by.1cc.1co.1cr.1dg.1dh.1dj.1ef.1eq.1f1.1fp.1fy.1g4.1gq.1hs.1ie.1j6.1jd.1jg.1jj.1k2.1kc.1kn"],["HSBCqueries",4,"o.x.15.7m.89.bu.bv.cl.f6.o0.o1.q7.t8.ti.wh.x5.y3.ys.104.118.147.18r.19w.1fj.1hq"],["HackerRank",4,"o.39.am.m7.q6.ys.162.1dj.1dm"],["HeadSetSerialNumber",7,"90.e3.jv.mj.mq.ms.qs.rl.rs.t0.x5.193.1dn.1jd"],["HeadphoneIssues",1,"90.cu.jz.mn.mo.mq.qs.tz.yx.zx.13v.15p.19s.1gd.1it.1jf.1jj.1k9.1ki"],["HolidayCalender",1,"7y.dc.fi.jv.ne.nf.ng.p4.sp.t0.zx.18a.18r.19t.1jd.1kn"],["Horizon lab training related queries",5,"o.15.39.4b.4d.5w.5y.ab.b9.c6.ei.eq.ew.g3.g8.kt.n0.nj.rn.se.10h.128.12w.13f.140.153.18a.1dj.1fh.1ho.1i2.1k9"],["ITAssetsAssignedInmyname",4,"48.4b.gf.ij.ik.jv.qm.sp.w7.ys.z6.179.1jd.1jg"],["ImageTroubleShoot",4,"i0.n4.og.ys.18g.18r"],["Install Horizon Client",5,"9g.eq.m4.nj.pe.pi.x3.129.19b.1bw.1el.1ho.1i2"],["Install slack application",11,"1e.3c.3i.ar.ex.pe.pf.po.19b.1a9.1kd"],["Slack Installation on Mobile",11,"3c.6y.9o.ex.m4.pe.pf.pi.qh.t8.vf.wh.10l.10m.187.19b.1a9"],["InternalJobPortal",1,"o.21.8c.8d.jv.p4.px.py.r2.r3.x3.y8.ze.zx.118.17l.1hf.1jd"],["InteropTool",4,"o.9t.iw.o3.p4.px.q1.q2.q3.q4.ys.15y.17b.1f7"],["Japser related Queries",4,"o.qu.qv.ys.13f.13p.153.162"],["Java Installation Guide",4,"36.ah.jv.m4.pe.pf.qw.ys.129.19e.1bw.1d1.1ed.1el.1jd"],["Jenkins related request",4,"o.x.1u.9t.c0.i0.j6.jd.nj.o3.p4.qx.r2.t4.t8.ys.153.162.198.1ar.1fx.1ha.1jh"],["JetBrains license for PyCharm IDE",2,"o.o8.qy.qz.sc.125.13c.13p.162.1al.1jd"],["Jfrog issues",4,"d.e.o.2y.39.43.7e.9g.9t.fp.o3.p4.r0.sk.sy.sz.y6.ys.12w.135.13p.19j.1e0.1gx.1jj"],["KB_Atlassian_assist",4,"4d.4l.ys.1he"],["Kibana Access",2,"o.rg.13p.162.1al.1jd"],["Laptop Overheating",7,"c9.j9.jz.mj.mx.my.n6.np.rs.tn.vr.wq.xp.z4.17s.1av.1e7.1f5.1hb.1hc"],["Laptop Password reset (also contains InnovyQ Password Reset)",0,"2u.4t.4w.b6.bw.c0.ic.jx.kb.kc.or.p4.rs.t2.t3.t4.to.wh.y6.yx.zp.10p.16h.16i.18e.1ar.1do.1k9"],["Laptop Serial Number",7,"47.ex.f0.jv.mj.rs.x5.z6.193.1d8.1jd"],["Laptops For Contractors",7,"bb.bc.mj.p4.rs.rt.wh.xr.11a.13p.15o.162.1k9"],["Launch VDI from Horizon Client",5,"9g.eq.nj.ry.rz.1ho.1i2.1jd"],["Leave Policy",1,"8e.jv.le.rl.s2.s3.ua.wm.zu.zx.112.18r.1g6.1jd.1jn.1kn"],["Lightning Force Issues",4,"o.1x.9t.ka.o3.p4.sf.yc.ys.118.14x.17z.1bg.1i0.1k9.1ka"],["LiquidSpace queries",4,"o.x.6p.6r.c0.m9.ml.p4.rq.sn.so.ys.ze.10f.13f.1b0.1dj.1k9.1kd"],["LoanerLaptop",7,"2m.6u.cr.cw.dd.df.ec.ex.fw.ge.hi.is.mj.n7.n9.nn.pw.rs.rt.sw.sx.to.wh.wm.xj.xz.yw.11a.11p.129.13p.14v.15q.162.166.17r.1c2.1e0.1e4.1ew.1fz.1gl.1j2.1jn.1jp.1k9"],["Logengine_Queries",4,"o.9t.o3.p4.t5.ys.12d.13f.162"],["Logz related Issue",4,"o.x.z.1y.dq.os.tb.ys.13m.153.162.1c7"],["Logz_access",2,"o.1u.26.3c.3i.7z.cp.cr.dm.j5.nj.o2.o3.p4.pj.rz.tb.tc.tl.ue.wh.118.12w.13q.162.19e.1al.1bk.1g9.1jg"],["LokiAccess",2,"o.3i.td.te.13p.162.166.1al"],["MAC Black Screen Issue",4,"3e.6g.jz.sj.to.ys.146.18e.1hu"],["MFTServerWebAccess",2,"o.x.9t.c0.o3.p4.t8.uy.zp.12w.16h.1al.1ar.1gw"],["MSDN subscription",9,"x.sc.vx.wb.wf.wh.1cf.1ij"],["MSFT Bookings",4,"x.3c.6s.h3.h4.vz.ys.yw.11a.162"],["MSTeamAccess",2,"o.r.s.x.17.3m.4e.6j.81.a7.bv.cy.ex.j0.j1.j2.ji.ml.rs.t4.t8.v1.w3.y4.y6.y7.yo.166.18b.19s.1al.1dk.1fs.1h3.1jh.1k2.1k9"],["MSproject",4,"o.43.9t.jy.o3.v1.w2.ys.12j.13p.162.1e2.1eu.1jd"],["Manual installation of Intelligent HUB/WS1",4,"e.o4.pe.pf.pr.to.u8.u9.ys.1i0.1jd"],["MicrosoftAuthenticatorReset",4,"x.3c.4x.hr.p4.ux.v1.v2.ys.15f.16h"],["Microsoft Copilot",4,"3.x.3h.bp.c0.gs.h3.sh.v1.vp.x7.ys.z0.11n.162"],["Microsoft Intune",4,"4w.f0.gd.he.i0.pi.q8.sc.uu.v1.vf.xz.ys.11o.14y.186.19e.1a9.1dj.1h3.1kd"],["Microsoft Premium License",2,"o.52.sc.v1.10t.11e.11n.12j.1al"],["Mobile Phone work profile",4,"2y.vf.ys.108.10j.10l.12h.15f.17g.1bw.1jq.1k2"],["Mongo DB access",2,"o.x.4k.p4.t8.vk.vl.166.1al"],["NTP server",4,"2v.p4.px.wh.x4.xz.ys.zh.194.1d0.1id"],["New headset reques",7,"56.7h.7u.9g.mj.mn.mp.mq.qs.rs.sg.uz.wh.yl.ym.zm.129.13p.161.162.169.1du.1e4.1ej.1g5.1ku"],["NewLaptopRequest",7,"g.24.27.2r.2t.3m.4d.5v.5x.5y.79.ah.bz.c0.cq.df.ee.ex.gb.gh.gx.hy.j0.ja.l4.ll.lm.m4.mj.mw.nr.oy.rl.rs.sg.to.tp.uh.vq.w4.wb.wc.wh.wk.x3.xr.yl.ym.109.113.11a.11k.126.127.129.13l.13p.142.14s.14t.15n.15o.15q.15r.162.166.16z.17f.17t.181.18e.1a4.1ad.1ae.1ar.1cc.1cx.1e0.1ed.1er.1gt.1h3.1ha.1hv.1ie.1jp.1jw.1k2.1kj.1ko"],["New_Distribution_List",4,"c0.ce.ch.ci.fj.gs.sp.wh.ys.z0.129.19k"],["NewhireITSupport",4,"36.4e.57.n8.r5.wb.wh.wi.wj.ys.14b.169.16a.1co.1ed"],["NoPower",7,"2m.6t.ad.ah.dj.ex.fi.mj.rs.to.tq.wt.11e.11f.1bo.1fz.1gm.1jp.1jz"],["Non-compliance notification",4,"ae.af.ex.i0.jz.ws.wy.ys.146.149"],["Notepad++",4,"3i.59.g4.o4.pe.ww.ys.1h6.1jd"],["Offboarding / Onboarding Employee",4,"ba.gx.h1.kp.wh.xg.xh.xw.xy.ys.129.1eu"],["Old Laptop BuyBack Policy",7,"g.2q.36.5g.7o.7p.7q.fw.jv.mj.p4.rs.rt.xi.xr.112.14s.1ed.1jd.1k2"],["InnovyQ IP Notification Guidelines",4,"bq.m5.p4.pp.wy.ys.zt.12s.1ff"],["OmniOfficeWorldwideLocationsAddressesContactnum",4,"1l.4j.5p.7i.8k.bt.nt.p4.qi.qt.tw.vt.xj.xu.ys.zi.10b.11c.1ak.1bf.1f3.1h0.1i0.1ia.1j8"],["InnovyQ Bangalore Reception",4,"5p.b4.p4.x5.ys.yx.13v.14c.1ar"],["InnovyQ Benefits",1,"65.ea.gy.i5.p4.uj.zx.1el.1i6.1ip"],["InnovyQ brand template",4,"59.74.76.fo.g4.p4.ys.1ar.1dp.1jd.1k1"],["InnovyQ branding product purchases",4,"o.59.75.76.7o.p4.t1.ur.ys.12e.12f.137.138.1c3.1cw.1jd"],["InnovyQ Community",4,"x.7m.9t.a4.dh.ml.p4.rb.t8.ys.14y.185.1fx"],["InnovyQ connect",4,"e.o.x.1l.2u.36.4b.8n.9v.ay.d7.e7.f7.fw.fz.gs.gx.h2.hu.i0.j0.jk.k7.ki.lc.lo.lx.ml.p4.pd.qj.rv.sc.sd.sg.su.sv.t8.tj.uo.xr.ys.ze.118.11z.12j.12r.130.165.169.18r.194.198.19u.19v.19w.1a5.1dl.1ds.1e8.1ed.1eg.1fs.1gz.1h3.1h9.1j6.1kd.1kn"],["InnovyQ Corporate Policies",4,"g.l.40.4e.a7.bv.es.ju.jv.k5.le.m5.mt.n4.nk.ot.p4.pm.ti.xn.ys.111.112.17q.19l.1dn.1h3.1jd"],["InnovyQEmployeePortal",4,"o.gx.jv.p4.p5.ys.118.1jd"],["InnovyQ Holiday Calendar",10,"7y.df.gs.ne.ot.p4.sk.sp.xf.z0.12w.18r.1hg.1jd.1k2"],["InnovyQ ID card queries",4,"17.1l.4j.5l.5m.89.gx.ht.le.p4.q7.tw.wh.xj.xl.ys.yw.13f.13p.15q.162.18y.19s.1ar.1bc.1dj.1h0.1i8.1i9.1jk"],["InnovyQInside",4,"e8.p4.p7.pc.ys.12i"],["InnovyQ Learning Hub",4,"o.r.4b.4u.8m.c5.g3.gb.gl.hb.hf.iq.iw.o4.p4.q7.rj.s1.ys.118.15k.18v.1dj.1fh.1fi"],["InnovyQPopup",4,"fw.kk.p4.p8.ys.zn.114"],["InnovyQ signature templates",4,"o.6i.jv.p4.ys.129.18r.19t.19x.1dq.1i0.1jd"],["InnovyQVDIpassword",5,"eq.p9.t3.t8.zp.18e.1ed.1gi.1ho.1i2"],["InnovyQ Wifi Password",0,"4t.5p.ay.c0.m1.p4.q0.rl.s8.u4.wf.xj.zp.12w.13v.162.1ar.1jm"],["Omnsb Queries",4,"o.x.5f.9t.cf.ds.p4.sg.ux.xv.ys.118.13f.162.19b.1cf.1h6.1ha.1kj"],["Onboard_newSupplier",4,"1e.60.77.s8.wh.wl.x3.xw.xy.ys.129.12b.14y.14z.19e.1bo.1bw.1cn.1hp"],["OneDrive Shared Libraries vs OneDrive InnovyQ",4,"x.p4.sb.xz.y0.ys.18r.19l.19s.1h3.1jg"],["OneDrive Sync Issues",4,"e.o.24.70.9p.cw.ex.g6.i0.jz.y0.ys.10g.146.1d0.1jq"],["OneDrivesignin",4,"g6.xz.y0.y1.ys.19w"],["Opentext access",2,"o.ya.13p.162.1al.1jd"],["Oracle Access",2,"o.c8.hz.yh.yi.12w.13p.162.19s.1al.1jd"],["Eloqua Related Queries",4,"o.c0.eu.gq.gv.hz.oc.p4.po.yh.ys.13f.153.1g7.1gq.1h6"],["OracleOICATPDBaccessRequest",2,"o.1x.3i.3l.4m.hz.jz.pj.wc.xq.yh.yk.12d.12w.13v.17k.19s.1al.1ar.1dj.1jk"],["OracleOICaccessrequest",2,"o.3i.jz.xq.yh.yj.13v.19s.1al.1ar.1jk"],["Origami related queries",4,"o.4e.9t.eh.ha.hu.nh.o3.p4.rn.yb.yr.ys.13f.153.162.1ap.1gz.1ha.1hm"],["OtterAi",4,"i0.ys.yu.yv.yw.1a1.1a6.1dj.1el.1ha.1jh"],["Outlook calendar reminders",10,"7y.ac.fh.gs.qa.ul.um.w6.x0.z0.12p.15a.15b.1kv"],["Outlook Crashes In VDI",5,"24.26.2u.ca.cc.cd.eq.hu.j3.k4.pc.rc.to.tp.vd.z0.19e.1c8.1gn.1gq.1gt.1gy.1ho.1i2.1jp"],["Outlook in slack",10,"1e.7y.ar.ay.gs.pn.z0.19b.19e.1a9.1ab.1bw.1d0"],["Outlook inbox view",10,"5g.8q.8r.gs.jz.om.tw.tx.ty.wu.z0.189.19c.1i0"],["Outlook - outbox issue",10,"5w.e2.g5.gs.gv.lg.ml.p4.rb.tg.tp.ty.wg.yy.z0.18r.18y.190.192.1c4.1c8.1d0.1ef.1gu.1k0"],["OutofOfficeemail_Outlook",10,"e.g.15.22.39.4d.50.53.54.59.5a.5g.61.7m.ar.b5.c0.dv.gf.gs.gv.h3.ho.m3.m4.n0.oq.ov.oz.rl.s8.ti.wy.xj.y5.yf.yt.yx.z0.z1.10c.129.12r.148.15s.15t.16u.16v.18z.19b.19c.19e.1bw.1cs.1dj.1dr.1fx.1gc.1go.1jd.1jz"],["IvvYBotv2Escalation",3,"6x.i3.13p.15u.199"],["IvvYBotv2Feedback",3,"6x.jf.lb.qr.12w.199.1ci"],["IvvY studio",4,"o.2m.36.59.6p.7k.b4.ce.e7.fw.gy.m4.ns.pv.qq.t0.xy.ys.12e.14h.14i.16g.19a.19s.1ac.1ar.1c5.1co.1ed.1fh.1g1.1h3.1ha.1hz.1iq.1jd.1jj.1k2"],["IvvYbotv2-About",3,"g.2m.4d.68.6x.fw.ir.je.ku.p4.wh.xr.199.1dc.1dn.1e7.1jj.1jn.1k2.1ks"],["PF related Queries",1,"20.4e.5p.7m.91.98.b4.bh.by.ce.cm.dt.es.fg.hx.kd.ke.ln.ml.on.p4.rv.rx.vj.vq.x2.x5.xj.yx.zx.zy.118.13f.13j.13v.153.17x.19s.19u.19z.1by.1cc.1cd.1dj.1eq.1fk.1jd.1jk.1jv"],["PagerDutyAccess",2,"o.7z.81.9t.m4.o3.p4.zf.zg.129.146.162.17k.1al.1el.1gt.1jh"],["PasswordManagers",0,"0.1p.1u.2o.2p.36.3c.3f.3i.3s.4t.59.5u.5y.7a.8o.a7.a9.ae.af.bv.d5.fw.he.hn.hu.jv.ow.p4.sp.u6.u7.uk.yo.yw.zp.zq.150.16c.18p.18q.1a2.1al.1bm.1cp.1dk.1h1.1h3.1h4.1hw.1jd.1jg"],["Password for InnovyQ VDI",5,"e.y.eq.p4.t8.yw.zp.zr.19b.19e.1ed.1h3.1ho.1i2.1iw"],["PaySlipIssue",1,"o.36.39.4d.8u.aj.b4.g4.jv.r9.vw.zx.zy.zz.118.13f.13p.153.162.17o.18r.1a4.1cc.1d1.1dj.1ed.1er.1jd.1k3"],["Payslip",1,"4.5.g.o.20.5w.5y.7m.90.9t.be.bg.bh.dt.du.e5.es.gx.hg.ib.js.jv.kd.lb.ny.oo.rb.rl.rv.tv.uh.x3.yx.zx.zy.10t.11j.12a.14r.17r.17x.18t.1b2.1cc.1cd.1dg.1dh.1dj.1f1.1fy.1i0.1ir.1jd.1jf.1jn.1kn"],["Peripherals Request",7,"t.1d.2d.2u.3f.7u.7v.82.8w.9f.9g.bi.ce.cq.e3.en.ex.fi.fp.fs.g6.gg.gx.iw.kq.ky.lt.mi.mj.mn.mp.mq.n8.nh.o4.qo.re.rs.sg.sk.to.v0.vm.vu.wh.x6.x8.xz.yl.zd.103.10d.117.11q.125.13p.147.15c.15d.15o.162.188.1a4.1af.1b4.1bh.1bs.1c6.1d7.1du.1ee.1eq.1fe.1h2.1iz.1j9.1jn.1jr.1k2.1k9.1ku"],["Phishing button on Outlook",10,"e.1e.59.7n.d0.gs.h3.jv.qj.vd.yf.z0.10k.15u.17e.18r.19u.1i0.1jd"],["Postman application",4,"3c.3i.g4.j0.pe.pi.sq.to.ys.11d.1h3.1iy.1jl"],["Preferred/Display Name change",4,"4d.8q.fi.sg.vi.w7.x3.ys.11m.1dj.1gq.1jd.1jj.1k3"],["Privacy/Security Concerns",4,"1l.39.ai.aj.f9.fw.gs.gy.sk.wa.wh.ys.yx.121.13v.17b.18q.1cc"],["PromethusAccess",2,"c.o.12m.12n.13p.162.1al.1jd"],["Core portal issues",4,"s.1e.4e.8q.8s.b4.b7.br.fu.ml.t8.tz.ys.101.118.15f.19w.1fs.1jj.1k9"],["ReportPhishing",4,"2i.4p.gv.tw.ut.ys.10k.11a.13f.15u.15x.1b1.1cv"],["RequestAccess2",2,"o.39.3c.69.6e.7m.ce.fp.fv.hu.n2.of.p4.rj.sg.sk.t8.12w.131.132.13b.13p.13v.162.163.166.18v.19j.1al.1e4.1fx.1jd.1jj.1jk"],["RequestAccess3",2,"e.o.1g.3c.3i.3m.9t.jj.jv.kh.o2.o4.p4.129.164.1al.1f8.1kd"],["Request for Shared Mailbox",4,"1e.4e.ce.ch.jr.kd.m4.om.tx.wh.ys.162.166.19b.19e.19k.19l.1ar"],["RequestToolAccess1",2,"o.2e.36.39.42.9t.ay.b0.cj.ck.io.k7.lb.o3.p4.px.sy.zp.12w.168.1al.1es.1g9.1h3.1ij"],["Reset airwatch.local password",0,"e.o.x.24.2e.4t.7m.8q.8r.90.9t.ay.ck.cq.gc.i0.l1.q9.rv.sy.t3.tg.wh.wz.x3.yx.zp.10l.13a.149.16h.177.1cz.1f1.1g9.1ij.1j2.1jd"],["Resignation_Process",1,"a7.m4.p4.s2.s4.zx.119.129.16j.16k.16m.1bo.1bw.1el"],["SFTPQueries",4,"o.4e.59.8i.9t.c0.cw.g4.j3.jm.jn.p4.t8.ys.118.153.19h.19i.1a7.1ar.1ed.1fk.1gw.1gx.1ha.1hx"],["SMIME certificate request",4,"o.8m.gs.h5.h6.tw.ys.12w.162.166.18y.1ah.1h8"],["SQLTraceAccess",2,"o.b4.hv.tl.129.12w.162.166.17r.18t.19s.1al.1bd.1be.1fd.1jd.1jk.1k2"],["SSL certificate renewal",4,"8l.8m.k3.px.qa.qb.wh.ys.10s.13p.15j.15k.162.17g.196.198.19j.1bi.1cf.1dj.1h8.1jd.1jj"],["SaasWatch request",1,"o.cw.hu.ii.sg.t8.zx.118.129.162.17u.17v.19l.1g7.1kj"],["Sales Commission related queries",4,"6s.a1.y7.ys.129.13f.14x.153.17y.1eq.1hh.1hj"],["SalesforceIssues",4,"e.o.x.1e.29.3c.3u.44.49.4b.4e.5t.62.8i.8j.9t.au.b4.c0.cy.db.es.jk.jz.k6.ka.lr.mc.p4.px.rm.sf.sg.sk.ti.u6.wh.x9.ys.zj.12j.13h.15u.17z.180.18i.18r.19b.19g.19w.1a5.1az.1dj.1e4.1h3.1i0.1jg.1jj"],["ScreenSteps_Query",4,"o.ys.13g.13p.162.18h"],["Seemplicity Access",2,"e.o.3c.3i.3u.o3.o4.pr.sp.xz.ze.162.18r.18u.1al.1ar.1kd"],["Service account tasks",4,"x.1e.ce.dg.dz.vi.wh.ys.zp.105.15f.162.16h.196.1df"],["ServiceRequest",4,"ay.cw.sk.ys.13p.162.196.197.1hx"],["Setting up the InnovyQ Pass",12,"x.1e.1s.32.3a.3c.4d.4e.4t.4u.4y.6y.9l.9o.9t.ar.b2.cb.cp.d2.eu.ex.f4.fc.fl.gc.gf.hf.hi.j0.jy.m0.p4.pk.r6.sk.t7.vc.vf.vv.wh.xr.xz.ys.za.zn.zo.10l.12o.19b.19c.19e.1ap.1bl.1bx.1d1.1eu.1fk.1g7.1h3.1ha.1hx.1j6.1jd.1jg.1jx"],["Share OneDrive File",4,"e.36.38.cy.jm.jn.k3.sk.y0.ys.yt.134.173.19k.19o.1ed.1hx"],["SharePoint related queries",4,"o.x.ce.cf.p4.wh.ys.13f.153.19n.1a7.1jd"],["Skybridge request",4,"o.s.90.cw.d7.es.ml.nj.sk.wh.ys.12w.14k.162.1a8.1cf.1ed.1el.1fs.1gr.1gz.1h3.1i0"],["Slack - add guests",11,"1e.3q.8u.ay.ce.iw.m2.p4.qa.up.13v.19s.1a9.1jj"],["Slack archival requests",11,"3w.3x.3z.8u.c0.dp.dz.ii.tg.z6.123.15f.167.1a9.1ar"],["Slack Channel Conversion",11,"5w.8q.8r.8u.bl.bm.bn.c0.p4.s5.z8.123.134.162.1a9"],["Slack channel creation",11,"8u.ce.ci.wb.wh.123.134.1a9"],["Slack channel manager requests",11,"o.1e.1u.8u.8v.c0.c4.rl.u6.uh.129.162.167.1a9.1dj.1gq"],["SlackChannelRename",11,"8u.123.15h.15i.1a9.1aa"],["Slack group creation",11,"1e.8u.8y.bj.ce.ci.ly.w5.105.10i.1a9"],["Slack Issues",11,"o.5s.a3.fx.gk.i0.ic.jz.k7.kr.ks.rb.t4.xz.yw.128.129.12r.142.16t.18j.1a9.1ap.1ar.1bw.1c2.1dj.1ek.1f7.1f9.1hb.1k2.1k9"],["Slack Sandbox access",11,"o.3c.6x.c0.ev.ew.p4.pj.ti.uh.183.1a9.1dj.1kd"],["Slack session time-out",11,"53.fw.i0.kk.yx.199.1a9.1en.1eu.1ev"],["Slack Update Issue",11,"e.3c.i0.rb.tg.1a9.1cp.1dj.1gq.1h3.1ha"],["Slack Webhooks",11,"ce.p4.10f.127.129.19c.1a9.1da.1j0.1j4.1jj"],["Smartsheet License",2,"e.o.3c.3i.7e.7m.i0.ki.lr.p4.sc.t8.u3.ve.x3.yq.zk.zp.10u.10v.12i.12j.166.16s.17d.17j.1ag.1al.1bj.1el.1eo.1h4.1h7.1kh.1kj"],["Snagit Access",2,"o.3c.3i.5z.90.ex.iy.jv.m8.pe.pg.sc.to.tp.ud.x3.xf.1ai.1al.1ji.1jp.1jq"],["SonarcQube Access",2,"e.o.2c.3i.9t.ki.o3.t8.162.1al.1ar.1as.1at.1au.1iu.1jk.1ke"],["Stolen laptop",7,"5y.jm.k6.ll.m4.mj.rs.tl.vd.x3.127.15u.15w.19s.1bw.1bz.1ei.1el.1jd"],["Switch Back to Classic Outlook",10,"5g.8q.9a.gs.wh.z0.1cx.1ht"],["SystemIssues",4,"2u.3c.5k.96.cc.dd.ew.ic.j0.j9.mf.mz.o5.rp.rs.tn.to.vm.wq.xa.xp.y4.y6.ys.z3.109.10r.113.13p.15o.162.16d.16z.18e.19o.1ad.1ae.1d1.1d2.1g2.1ha.1hv.1ik.1jp.1k9.1kv"],["TableauAccess-Issues",2,"2.g.o.3d.4e.4q.9o.9t.b4.cy.d5.fx.fz.g9.it.jt.kx.nv.o3.od.pj.q7.sk.tl.w1.wh.y3.y4.yl.10e.12w.13p.153.15u.162.17s.19s.1a7.1al.1ar.1d5.1d6.1dj.1i0.1i1.1j7.1jd.1je.1jk"],["Teams meeting in Outlook",10,"1e.7y.90.ce.cf.gs.h3.jz.qj.ul.um.yt.z0.10z.18a.19s.19u.1dj.1dk.1i4.1i5"],["Terminal usage on Mac",4,"9x.to.ys.17r.1dv.1fz.1h1"],["Territory assignment in SFDC",4,"49.4c.ys.13p.162.19g.19s.1dz.1jd.1jj.1jn"],["Test",4,"i3.i4.ps.ys.1e0.1e4"],["Test device",4,"4e.7i.ex.f0.qe.t0.vt.ym.ys.162.1aq.1e0.1gy.1i0"],["Test Drive Related Issues",4,"36.5y.9t.g6.j2.o3.ry.ys.131.153.1b7.1ci.1dj.1e0.1e2.1fx.1g2.1g9.1h6"],["Testgrid related issues",4,"o.63.jz.lw.o3.p4.sk.t8.uu.ys.13v.153.19s.1ar.1bj.1e0.1e3.1jk.1k9"],["Testrail related issues",4,"e.o.63.7m.8f.9t.d6.nj.p4.rj.ry.t8.y6.ys.12j.12w.13o.153.18r.1e0.1e5.1fx.1jj"],["Text Font installation",4,"g4.k8.k9.m4.pe.pf.to.ys.yz.1ar.1cs.1e6.1jd.1jp"],["Thunderbird Email Client",10,"9c.9g.at.c1.gs.jv.ox.p4.z0.10v.1co.1cp.1ed.1ep.1ir"],["To add/remove Testing device from ABM",4,"f.1e.36.3f.5g.7k.c0.ex.f0.k7.p4.q7.u6.ys.154.155.15f.162.1an.1e4.1ie"],["Trellix_maconrisk",4,"3e.3i.fw.i0.j0.to.tr.ui.ys.153.17i.18e.19u.1fn"],["Trello Premium",4,"o.1v.2u.4l.7y.9w.d5.ia.rl.sc.sg.wc.xx.ys.11n.12c.12e.17r.1d4.1dj.1ew.1fo.1h3.1hd.1i0.1kd.1kj"],["Troubleshoot Monitor in office",7,"9.e.4e.az.ep.et.iw.k0.k2.mj.n0.qq.re.rs.vm.vu.xj.10d.12r.16q.18y.1ar.1b6.1c2.1dj.1ft.1h3.1k9"],["Troubleshooting Boxer app",4,"o.3c.3i.71.ar.e9.ex.gs.hm.i0.i2.jh.p4.qe.t8.vf.xc.y6.ys.zn.zo.10j.149.194.19c.19e.19v.19w.1a9.1c2.1dj.1fq.1ft.1fu.1fw.1fx.1gh.1gl.1k9"],["Turn on developer mode in VDI",5,"eq.ev.vg.1ar.1fz.1ho.1i2.1ix"],["UEM AW installer token",4,"39.45.8l.b2.fz.j8.ph.q7.rj.ys.17r.17s.19k.1dj.1f2.1g9.1jg"],["UEM Snap Tool",4,"o.90.c0.j2.jg.ys.10e.10y.12w.17r.1aj.1ar.1bv.1dj.1f2.1f7.1g9.1jn"],["USB access",2,"e.o.ih.rl.uh.10e.117.127.129.13p.13r.162.172.1al.1bw.1h2.1h3.1ha"],["Unable to login to Slack",11,"e.o.a3.gk.j2.j4.jz.n3.rc.t8.xz.yw.128.129.1a9.1ar.1c4.1cr.1f9"],["UnabletoLoginMac",4,"e.m.o.45.4e.a7.bv.ex.fz.gb.h5.h6.j1.j2.kb.ml.p4.q7.ql.rd.rl.t3.t4.t7.t8.to.tp.u4.wb.ys.yx.zp.14l.14m.159.16h.16i.18e.19s.1c4.1fs.1ga.1gi.1gk.1k2.1k9.1kl"],["narchive slack channel",11,"v.3y.8u.8v.dz.n0.w8.1a9.1gb"],["Unenroll device",8,"dz.ex.f0.hf.hg.hi.rk.xz.15f.1g3.1g9.1gg"],["Unlock ADAM account",0,"o.x.1b.1s.4t.t3.yx.zp.127.19u.1gi.1gj.1hm"],["Unlock VDI account",5,"x.eq.t3.yx.1ar.1gi.1ho.1i2"],["Update Bank Details",1,"x.5q.5r.8q.90.9j.es.ii.wh.yw.zx.17x.1gq.1jd"],["VDI- Connection Issue",5,"ay.b0.b1.eq.i0.i7.j1.l1.ll.nj.q7.ry.t7.us.yx.194.199.1bo.1eu.1ev.1ho.1i2.1jh.1jz"],["VDI Outlook Issue",5,"o.23.24.4d.63.9e.9k.b8.d4.eq.i0.j0.jz.nj.rc.rj.ry.uq.us.y6.z0.10y.18e.18v.199.1ar.1ba.1c4.1cu.1dj.1fw.1ho.1i2.1k2"],["VDI certificate error",5,"8m.eq.i0.jz.xp.116.18r.1ho.1i2"],["VDI Access",5,"o.1u.2y.3c.3u.45.4b.ck.d3.eq.hc.nj.pe.wp.zp.12w.162.16a.17h.1al.1c5.1d1.1h7.1ho.1i2.1jp"],["VDI host file access",5,"o.1u.39.b7.eq.fy.hk.jm.nl.uc.12w.17h.1br.1gq.1ho.1i2"],["VPN connection on Linux",9,"e.ay.b1.le.nl.sk.sm.to.wf.12u.1ar.1g8.1gr.1ha.1ij.1jh.1jp.1jx"],["VSRC access issues",2,"o.r1.1al.1es.1i0.1in"],["Value Realizer- related queries",4,"e.o.h3.ti.ys.13f.13z.153.1dj.1f7.1hi.1j1"],["Varicent",1,"o.24.c0.lb.qj.ra.rh.sv.zw.zx.12w.18e.1bj.1by.1c4.1f7.1hj.1ji"],["Vault",4,"e.o.9t.ay.ce.i0.n0.o3.p0.p4.sv.t4.xz.yd.ys.yw.ze.12d.162.18n.1dj.1fx.1hk.1jd"],["Visa application",4,"1i.3i.3m.3q.5p.6r.7k.8m.bw.ft.hj.ht.m4.n0.ot.oy.s2.s9.w6.we.wo.xb.ys.12q.13p.15k.162.181.18c.19s.1cs.1fc.1fm.1i3.1i7.1jd.1jg.1jj"],["Visual Studio",4,"39.io.it.rd.sc.vx.ys.125.129.12e.12g.15l.1c5.1cf.1f1.1ib"],["VsphereorVcloudIssues",4,"o.x.1s.24.4v.5p.7m.8t.9l.9o.9t.a2.ce.ck.ef.fx.hm.i0.ic.kd.o3.p0.p4.q9.ys.yw.zn.zp.147.162.181.182.186.18w.195.19v.1ar.1cd.1dj.1ds.1ec.1eq.1fq.1fx.1gq.1ha.1hn.1ie.1il.1im.1jh.1k2"],["Unable to lock windows Laptop",4,"ah.i0.rs.t2.yf.ys.1ed.1jp.1k9"],["WisprAccess",2,"o.13p.162.1al.1jd.1js.1jt"],["Wiz portal access",2,"o.2u.3c.c0.o3.sg.118.162.1al.1jy"],["Wiz portal issues",4,"3c.3i.7m.hp.o4.pr.rl.t8.uh.ys.118.188.18a.18r.19s.1ar.1jy"],["Work Place support request",4,"5p.c0.ep.vm.xj.ys.10s.162.19b.1ar.1bn.1co.1d4.1k2.1k9.1kb"],["WorkdayHR",1,"o.3m.3r.5n.5r.8x.90.ba.ce.d5.ej.es.f8.hk.ht.hw.oy.px.r2.s2.t8.u6.xf.yn.zx.zy.10j.13h.162.16e.16j.16k.1dx.1eu.1gq.1h3.1i0.1k3.1k4.1k7"],["Workday queries",1,"k.o.y.1l.2i.30.32.3c.3i.3m.3q.3r.5g.5n.5q.5r.6j.6o.7k.7y.7z.85.8p.8q.8s.8x.90.a5.aa.b4.ba.bb.bw.c2.c3.ce.d5.d6.dk.eb.ej.es.f8.fr.fu.fz.gn.gw.gz.h3.h7.hk.hs.ht.hw.is.iu.iv.jf.jq.jv.kb.na.ne.ni.om.ot.oy.px.q5.qc.qt.r2.rw.s2.st.t8.u6.ua.vf.vv.w6.w7.w9.xf.xi.y4.y6.y8.yn.zv.zx.104.106.109.10c.10e.10j.10l.11m.12h.13f.13i.13k.14h.14n.14p.156.15y.160.162.16a.16e.16f.16k.174.17x.18o.18y.19q.19v.1ay.1bb.1bt.1ca.1ck.1co.1d3.1dd.1df.1dj.1dw.1dx.1eq.1eu.1ex.1f0.1gq.1h3.1i0.1ii.1j3.1jd.1jg.1ju.1jw.1k3.1k6.1k7"],["WorkspaceOneaccess",2,"o.r.1u.b4.cw.gj.p4.t1.xz.110.162.18d.1al.1dt.1g9.1jj.1kd.1ke.1kf"],["ZoomAIcompanion",2,"o.2m.54.55.a6.c0.fd.fz.h3.h4.if.ld.t3.u9.ul.um.yf.153.19d.19o.1al.1bw.1ck.1ed.1iw.1k9.1kv.1kw"],["Zoom Background Issue inside VDI",5,"1e.1g.5i.5j.ar.eq.hu.of.p4.pc.12x.1ha.1ho.1i2.1ic.1jh.1kv"],["ZoomInfo",2,"o.ox.sc.sg.yx.13v.162.19s.1al.1jk.1kv.1ky"],["ZoomIssues",2,"o.s.x.1e.36.37.4e.4q.4s.4u.4w.6p.7y.7z.c1.f2.ic.ie.j0.mh.ml.nj.q7.qa.r4.r8.rc.ro.sk.t4.t6.tf.ti.ul.um.wh.y4.y7.yx.18v.1al.1av.1ek.1eu.1ez.1fz.1hr.1hy.1iw.1jw.1k9.1kv.1kz"],["ZoomPhoneNumber",2,"o.x.x5.10l.1al.1jn.1kv.1l0"],["Zoom recording deletion",2,"o.dz.e1.14i.14j.15f.1al.1kv"],["Zoom in VDI",5,"eq.pe.pf.rx.1gq.1ho.1ht.1i2.1kv"],["Zoomin Documentation Portal",2,"o.ft.118.1al.1kx"],["airwatchABM",4,"f.2e.2f.hg.ys"],["applicationonboarding_workspace",4,"o.3c.3i.3k.60.kd.p1.p2.wh.xy.xz.ys.129.14y.14z.162.1bo.1ca.1cc.1fr.1k8.1kd"],["Claude_license",2,"o.8y.9b.hc.hn.sc.sg.1al.1dj.1k2.1kj"],["configurationMaximus",4,"b.ap.aq.rl.ug.ys.1f7.1h3"],["devices_enrolled_asofnow",4,"46.90.f0.hg.ua.x5.ys"],["file_vault",4,"jm.rj.to.xf.ys.1fz.1g0.1hk"],["live_agent",3,"28.6x.sr.199.1da"],["loginissue_Core_portal",4,"s.br.ml.t8.t9.ys.118.19w.1fs"],["msEngage",4,"vy.ys.1he"],["privacyScreens",4,"36.an.d7.dl.rl.rs.rt.sg.vn.vr.ys.zx.121.122.12x.134.18e.18f.191.1b0.1dj.1ed.1jg.1k9.1kj"],["CoreIconchange",4,"3i.8q.br.bs.o7.ys.10n"],["ram portal issues",4,"o.s.4d.4e.9t.ml.o3.p4.qj.sl.sv.ys.118.13s.1ar.1fs.1k9"],["secondaryLaptop",7,"41.4d.c0.mj.n0.rs.sg.ti.tp.11l.12w.162.18k.18l.18m.1ar.1dj.1k2.1kj"],["vcd_queries",5,"o.eq.13f.162.1hl.1ho.1i2"],["vpn_connection_issues",9,"e.o.s.4d.ay.b0.b1.e9.i0.le.ml.wb.wf.x3.12u.153.17g.1eu.1fs.1ft.1h3.1ij"],["workdayLocation",1,"8q.8r.es.gx.t1.vi.zx.14q.15c.19d.1d1.1gq.1k2.1k3.1k5"]]};

  var ASK = {
    q: 'My timesheet won’t submit and the deadline is in an hour',
    extra: [],               // intents approved in the learning-loop widget
    fns: [],
    on: function (fn) { ASK.fns.push(fn); },
    set: function (q, src) {
      ASK.q = q;
      ASK.fns.forEach(function (f) { try { f(src); } catch (e) {} });
    }
  };

  /* ---------- the matcher: a port of invoke_local_kb ---------- */
  var STOP = ('the a an to of in on for and or is are am i my me you your it this that how do can cant ' +
    'cannot not with at be have has get getting unable issue issues problem help please need want when ' +
    'what why if im ive was were from').split(' ');
  function tokens(text, extraStop) {
    var out = [], seen = {};
    (String(text || '').toLowerCase().match(/[a-z0-9]+/g) || []).forEach(function (t) {
      if (t.length > 2 && STOP.indexOf(t) === -1 && !(extraStop && extraStop[t]) && !seen[t]) {
        seen[t] = 1; out.push(t);
      }
    });
    return out;
  }
  var base = null;
  function kb() {
    if (!base) {
      var vocab = KB.vocab.split(' ');
      base = KB.rows.map(function (r) {
        var set = {};
        if (r[2]) r[2].split('.').forEach(function (k) { set[vocab[parseInt(k, 36)]] = 1; });
        return { name: r[0], cat: KB.cats[r[1]], set: set };
      });
    }
    var rows = base.concat(ASK.extra), df = {};
    rows.forEach(function (r) { for (var t in r.set) df[t] = (df[t] || 0) + 1; });
    var n = rows.length, idf = {};
    for (var t in df) idf[t] = Math.log((n + 1) / (df[t] + 1)) + 1;
    return { rows: rows, idf: idf, df: df, n: n };
  }
  function match(q, extraStop) {
    var K = kb(), qt = tokens(q, extraStop);
    var w = function (t) { return K.idf[t] != null ? K.idf[t] : 1; };
    var den = qt.reduce(function (a, t) { return a + w(t); }, 0);
    var scored = [];
    K.rows.forEach(function (r, i) {
      var m = qt.filter(function (t) { return r.set[t]; });
      if (m.length) scored.push({ i: i, name: r.name, cat: r.cat, matched: m,
        score: m.reduce(function (a, t) { return a + w(t); }, 0) / den, extra: !!r.extra });
    });
    // file order breaks ties, as the strict > in the Python does
    scored.sort(function (a, b) { return b.score - a.score || a.i - b.i; });
    return { tokens: qt.map(function (t) { return { t: t, idf: w(t), df: K.df[t] || 0 }; }),
             top: scored.slice(0, 5), best: scored[0] || null, n: K.n };
  }
  var MIN = 0.30;
  function f3(x) { return x.toFixed(3); }

  /* ---------- OCR data, from ocr/results at 61fe183 ---------- */
  var GT = {
    pcq: ['PCQ Access', 'Access Denied', 'Error: You do not have access to PCQ',
          'Contact IT support to request access.', 'User needs PCQ application access.',
          'Request: I need access to PCQ', 'Project IVY image-flow test screenshot'],
    ts: ['TimeTrack Portal', 'Timesheet submission failed',
         'Error: Timesheet period is locked for payroll processing', 'Employee: Test User',
         'Week ending: 30 Jun 2026', 'Request: help me submit my locked timesheet',
         'Project IVY unmatched image-flow test screenshot']
  };
  // Each engine's prediction, stored as edits to the ground truth lines.
  function edit(card, f) { var l = GT[card].slice(); f(l); return l; }
  var PRED = {
    easyocr: {
      pcq: edit('pcq', function (l) { l[3] = 'Contact IT support to request access'; l[5] = 'need access to PCQ\nRequest:'; }),
      ts: GT.ts.slice()
    },
    paddleocr: {
      pcq: edit('pcq', function (l) { l[3] += '.'; l[4] += '.'; }),
      ts: edit('ts', function (l) { l[1] = 'Timesheet submissjon failed.'; })
    },
    textract: { pcq: GT.pcq.slice(), ts: edit('ts', function (l) { l[0] = 'Time Track Portal'; }) },
    mistral: { pcq: GT.pcq.slice(), ts: GT.ts.slice() }
  };
  var ENG = [
    { id: 'easyocr', label: 'EasyOCR', load: 12141.6, lat: 2184.2, acc: 97.43 },
    { id: 'paddleocr', label: 'PaddleOCR', load: 10594.4, lat: 1075.0, acc: 98.94 },
    { id: 'textract', label: 'Textract', load: 38.2, lat: 1551.3, acc: 99.92 },
    { id: 'mistral', label: 'Mistral OCR', load: 1419.9, lat: 822.6, acc: 100 }
  ];
  function normWs(s) { return String(s).trim().replace(/\s+/g, ' '); }
  // Levenshtein with a backtrace, the same DP as ocr/metrics.py
  function diff(pred, ref) {
    var a = pred.split(''), b = ref.split(''), n = a.length, m = b.length, D = [], i, j;
    for (i = 0; i <= n; i++) { D[i] = [i]; }
    for (j = 0; j <= m; j++) D[0][j] = j;
    for (i = 1; i <= n; i++) for (j = 1; j <= m; j++) {
      D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    var ops = []; i = n; j = m;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && D[i][j] === D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) {
        ops.push([a[i - 1] === b[j - 1] ? '=' : '~', a[i - 1], b[j - 1]]); i--; j--;
      } else if (i > 0 && D[i][j] === D[i - 1][j] + 1) { ops.push(['+', a[i - 1], '']); i--; }
      else { ops.push(['-', '', b[j - 1]]); j--; }
    }
    return { dist: D[n][m], ops: ops.reverse() };
  }

  /* ---------- the learning loop's four tickets (agents/connectors.py) ---------- */
  var TICKETS = [
    { id: 'SUP-1001', cat: 'Password & Auth', summary: 'Can’t reset my ADAM account password',
      req: 'Reset ADAM privileged password', ph: ['reset my ADAM password', 'ADAM self service link errors'] },
    { id: 'SUP-1002', cat: 'VPN & Network', summary: 'GlobalProtect VPN keeps disconnecting on my laptop',
      req: 'GlobalProtect VPN disconnecting', ph: ['my vpn keeps dropping', 'globalprotect disconnects'] },
    { id: 'SUP-1003', cat: 'Software & Access', summary: 'Need access to Smartsheet',
      req: 'Get access to Smartsheet', ph: ['how do I get Smartsheet access', 'smartsheet SSO no application found'] },
    { id: 'SUP-1004', cat: 'Software & Access', summary: 'Requesting Smartsheet license for planning',
      req: { mock: 'Get a Smartsheet license for planning', demo: 'Get access to a Smartsheet license for planning' },
      ph: ['I need a Smartsheet license', 'smartsheet for project plans'] }
  ];
  var SYN_STOP = ('the a an to my i is are for of in on and how do can get need please help with me am ' +
    'unable not cannot want would like').split(' ');
  function synTok(s) {
    var o = {};
    (String(s).toLowerCase().match(/[a-z0-9]+/g) || []).forEach(function (w) {
      if (w.length > 1 && SYN_STOP.indexOf(w) === -1) o[w] = 1;
    });
    return o;
  }
  function jac(a, b) {
    var i = 0, u = 0, k;
    for (k in a) { u++; if (b[k]) i++; }
    for (k in b) if (!a[k]) u++;
    return u ? i / u : 0;
  }
  function cluster(items, th) {
    var byCat = {}, order = [], out = [];
    items.forEach(function (it) {
      if (!byCat[it.cat]) { byCat[it.cat] = []; order.push(it.cat); }
      byCat[it.cat].push(it);
    });
    order.forEach(function (c) {
      var local = [];
      byCat[c].forEach(function (it) {
        var t = synTok(it.request), best = null, bs = 0;
        local.forEach(function (cl) { var s = jac(t, cl.tokens); if (s > bs) { bs = s; best = cl; } });
        if (best && bs >= th) { best.items.push(it); for (var k in t) best.tokens[k] = 1; }
        else local.push({ cat: c, tokens: t, items: [it] });
      });
      out = out.concat(local);
    });
    return out;
  }
  function pascal(s) {
    return (String(s).match(/[0-9A-Za-z]+/g) || []).map(function (p) { return p.charAt(0).toUpperCase() + p.slice(1); }).join('');
  }
  // label_cluster with the mock's three canned labels; a fourth cluster
  // exhausts the queue and falls back to _fallback_name.
  var CANNED = ['AdamPasswordReset', 'VpnDisconnecting', 'SmartsheetAccess'];
  function label(cl, i) {
    if (i < CANNED.length) return CANNED[i];
    var counts = {};
    cl.items.forEach(function (it) { for (var k in synTok(it.request)) counts[k] = (counts[k] || 0) + 1; });
    var top = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || (a < b ? -1 : 1); }).slice(0, 2);
    return pascal(cl.cat) + pascal(top.join(' '));
  }

  /* ---------- who keeps the utterance ---------- */
  // Shared strings between ApplicationLicenses (51) and five specific intents.
  // Strings are shown only where reviewed as free of internal names, URLs and
  // people; the rest are counted but withheld.
  var SHARED = [
    ['Smartsheet License', ['Requesting for smartsheet License', null, 'How do I get access Smartsheet?', null]],
    ['Wiz portal access', ['Could I please get access to Wiz?', null, 'I need access to Wiz.', 'I’d also like to request access to the Wiz app please']],
    ['Logz_access', ['please help me to get the Logzio access again', null, null, null, null, null,
      'I raised the request to get the access to logz application', 'I want to access to logz app which can be launched', null]],
    ['SonarcQube Access', [null, 'I need access to SonarQube.', null, 'To whom i have to request for SonarQube?', 'How to get an access for SonarQube?']],
    ['GithubAccess', ['Github access', 'How can I regain access to github?', 'How do I request access to github?',
      'Hi, Im unable to connect to github', 'unable to login error when logging into github.', 'request access to github?']]
  ];
  var RULES = {
    small: { label: 'Smallest intent wins (shipped)', removed: 57, emptied: 4 },
    file: { label: 'First in file wins', removed: 57, emptied: 12 },
    big: { label: 'Biggest intent wins', removed: 57, emptied: 13 }
  };

  /* ---------- the ownership strip: git blame at bbdf83a ---------- */
  var OWN = [
    ['lambda_o3_slack_worker.py', 8049, 772, 'the worker: sessions, Lex, every path; my 772 lines are the ladder and the local KB'],
    ['lambda_o3_live_agent.py', 4075, 0, 'the live-agent handoff'],
    ['agents/*.py', 0, 1805, 'the learning loop: ingest, cluster, label, review'],
    ['kb-connect/js', 0, 1481, 'knowledge-source connection UI (prototype)'],
    ['lambda_o3_slack_summarizer.py', 1456, 0, 'conversation summaries'],
    ['live_agent_capacity.py', 1392, 0, 'the capacity-reserving dispatcher'],
    ['lambda_o3_admin_api.py', 0, 937, 'multi-tenant admin API (prototype)'],
    ['lambda_o3_slack_handler.py', 826, 125, 'Slack events in, dedupe, SQS'],
    ['chat_locks.py', 731, 0, 'per-agent chat locks'],
    ['scripts/*.py', 0, 663, 'offline intent generation and loading'],
    ['load_lex_intents_from_excel.py', 421, 220, 'the Lex loader; my 220 include the dedupe'],
    ['lambda_o3_jsm_oncall_user.py', 625, 0, 'on-call sync from Jira Service Management'],
    ['lambda_o3_slack_timeout_handler.py', 496, 0, 'the 30-second inactivity timeout'],
    ['ocr/', 0, 471, 'the OCR Lambda: engine registry and container'],
    ['lambda_o3_claude_fallback.py', 241, 42, 'the LLM fallback; my 42 are the prompt rewrite and Converse API'],
    ['lambda_o3_intents.py', 0, 279, '/generate-intents and the Approve/Deny buttons'],
    ['lambda_kb_connect_oauth.py', 0, 207, 'Atlassian OAuth for kb-connect (prototype)'],
    ['lambda_o3_lex_intent_loader.py', 0, 97, 'loads approved intents into Lex']
  ];

  Article.register('ivy-slack-agent', {
    form: 'ladder',
    scramble: 'L1L2L3L4→↓▮▯#@',
    rail: 'ask',
    dek: 'IVY was a Slack bot for internal IT questions at InnovyQ, built by two of us in the summer of 2026. A teammate built the pipe every message travels through. I built what happens when the first answer isn’t good enough: a ladder from a fixed intent model, down through a knowledge base and a language model, to a person. This piece follows one question down it.',

    opener: function (c) {
      var s = '';
      [24, 50, 76, 102].forEach(function (y, i) {
        s += '<line x1="40" y1="' + y + '" x2="88" y2="' + y + '" stroke="' + (i === 1 ? c.a : c.l) + '" stroke-width="' + (i === 1 ? 2.4 : 1.4) + '"/>';
      });
      s += '<line x1="40" y1="12" x2="40" y2="116" stroke="' + c.i + '" stroke-width="1.6"/>';
      s += '<line x1="88" y1="12" x2="88" y2="116" stroke="' + c.i + '" stroke-width="1.6"/>';
      s += '<circle cx="64" cy="50" r="5" fill="' + c.a + '"/>';
      s += '<path d="M64 60 L64 70 M60 66 L64 70 L68 66" stroke="' + c.a + '" stroke-width="1.4" fill="none"/>';
      return s;
    },

    chapters: [
      {
        id: 'lex', label: 'Rung 1 · Lex', title: 'Two authors, one question',
        art: function (c) {
          return '<rect x="20" y="40" width="88" height="14" fill="none" stroke="' + c.l + '"/>' +
            '<rect x="20" y="40" width="70" height="14" fill="' + c.p + '"/>' +
            '<rect x="20" y="66" width="120" height="14" fill="' + c.a + '"/>' +
            '<text x="20" y="34" font-size="10" font-family="monospace" fill="' + c.i + '">git blame</text>';
        },
        blocks: [
          { p: 'Before the question, the credits. IVY has two authors, and git blame splits the code cleanly. [[A teammate|them]] wrote the pipe: the Slack handler, the 8,821-line worker that holds every conversation, the ticket lock, the live-agent dispatcher, on-call sync and the timeout handler. [[I|me]] wrote the parts in the other colour.^[Line counts from git blame --line-porcelain, per file, at bbdf83a, the last commit in my local clone.]',
            notes: [['the other colour', 'so "I" in this piece means only these lines']] },
          { widget: 'owners', size: 'wide', caption: 'Lines per file by author, from git blame at bbdf83a. Hatched bars are a teammate’s, solid bars are mine. Press either total to grey out the other author. Vendored packages and tests are left out on both sides.' },
          { p: 'So when I write "I" below, I mean those files and the line ranges inside the worker that run the ladder. Everything else is the system my work plugs into, and I’ll say so when we cross into it.' },
          { p: 'The question comes from the demo script I wrote for showing IVY off: "My timesheet won’t submit and the deadline is in an hour." I picked it because it is vague in the way real requests are. It names a symptom, not a system, and it has a clock on it.' },
          { p: 'You can change it. The box labelled "Ask IVY something" holds the question, and every figure below re-runs on whatever you type there.' },
          { scrolly: 'ladder', caption: 'The ladder as the worker decides it, with the real flags. The bot’s lines are the strings in lambda_o3_slack_worker.py. Lex, the LLM and the human are not run here; the knowledge-base rung is, on your question.',
            steps: [
              { p: 'A message leaves Slack, goes through API Gateway to the handler, is deduplicated by `event_id` and lands on SQS. The worker picks it up. All of that is my teammate’s, and it is why a slow reply never becomes two replies.', state: { at: 0, ladder: true, kb: true, lex: false } },
              { p: 'The worker asks **Lex V2** first. Lex is deterministic: it only knows the intents it was given, 333 in the full export, 65 of which run a Lambda and actually do something. For the timesheet question it has nothing confident.^[333 intents and 65 Lambda-backed: data/lex_full_export_preview.json. The demo script expects Lex to miss this question.]', state: { at: 1, ladder: true, kb: true, lex: false } },
              { p: 'Here is the first decision that is mine. When Lex misses and a knowledge base exists, IVY does **not** run it straight away. It says so and asks: *"Want me to search the knowledge base?"* The user presses a button to go down a rung, so each layer reads as its own step.', state: { at: 2, ladder: true, kb: true, lex: false } },
              { p: 'If no knowledge base is provisioned, there is nothing to offer. The worker skips the rung silently and runs the next one in the background, stopping at the first that gives a real answer. Untick the knowledge base and watch the rung grey out.', state: { at: 2, ladder: true, kb: false, lex: false } },
              { p: 'Every button carries its own state: the next rung and the question, cut to 1,500 characters. The ladder needs no extra session record to know where it is. Rung 3 is the LLM; the last button hands over to a person.', state: { at: 4, ladder: true, kb: true, lex: false } },
              { p: 'One honest caveat. The whole ladder sits behind `ENABLE_ESCALATION_LADDER`, which defaults to off. With it off, the worker runs my teammate’s original path and none of these buttons appear.', state: { at: 1, ladder: false, kb: true, lex: false } }
            ] },
          { h: 'Lex’s one hard rule' },
          { p: 'Lex earns its place at the top because it is cheap and cannot make things up. It also has a rule that bit me when I loaded the full export: a Lex V2 build fails if one sample utterance belongs to two intents. The export had 2,672 utterances, of which 2,615 were distinct. Fifty-four strings were shared, and 57 copies had to go.^[Computed read-only over data/intent_kb.json with the loader’s own dedupe function.]' },
          { p: 'The question is who keeps each one. My answer in `dedupe_cross_intent_utterances` is the intent with the fewest utterances. The specific intent keeps its phrasing, and the broad catch-all lets it go. Under that rule, [[ApplicationLicenses|al]] drops from 51 utterances to {{al-count|23}}.',
            notes: [['the intent with the fewest utterances', 'specific beats general, by count alone']] },
          { widget: 'tug', size: 'wide', caption: 'ApplicationLicenses against the five intents whose every utterance it also holds. Pick a rule and see who keeps each shared phrasing. Phrasings that name internal systems, links or people are counted but withheld. The 57 removals and the emptied-intent counts are for the whole 330-intent export under each rule.' },
          { p: 'Pick either of the other rules and the five specific intents end up empty, so Lex prunes them. After that, "How do I request access to github?" lands on a generic licence intent. Nothing errors. The build passes, and the bot just gets vaguer.' }
        ]
      },
      {
        id: 'kb', label: 'Rung 2 · Knowledge base', title: 'A 0.30 line through 330 answers',
        art: function (c) {
          return '<line x1="10" y1="60" x2="150" y2="60" stroke="' + c.a + '" stroke-dasharray="4 3"/>' +
            '<rect x="20" y="30" width="16" height="70" fill="' + c.a + '"/><rect x="50" y="52" width="16" height="48" fill="' + c.m + '"/>' +
            '<rect x="80" y="74" width="16" height="26" fill="' + c.p + '"/><rect x="110" y="86" width="16" height="14" fill="' + c.p + '"/>';
        },
        blocks: [
          { quote: 'A temporary stand-in for a Bedrock KB.', cite: 'my own comment, lambda_o3_slack_worker.py' },
          { p: 'The second rung was meant to be a Bedrock knowledge base. None was provisioned while I worked on it, so I wrote a local one: the 330 exported intents that have an answer, loaded from one JSON file, searched in memory. That gives 2,672 utterances in 13 categories.^[data/intent_kb.json: 330 intents with responses, 2,672 utterances, 13 categories, 2,137 distinct tokens.]',
            notes: [['searched in memory', 'no vector store, no extra bill']] },
          { p: 'The matcher is keyword overlap, weighted so rare words count for more. A word that appears in one intent, like [[pcq|pcq]], weighs 6.11. A word in 150 of them, like [[access|access]], weighs 1.79. The score is the share of your question’s weight that an intent covers, and a hit needs at least 0.30.' },
          { tex: '\\mathrm{idf}(t) = \\ln\\frac{N+1}{\\mathrm{df}(t)+1} + 1',
            caption: 'A word’s weight. N = 330, and a word the knowledge base has never seen weighs 1.' },
          { tex: '\\mathrm{score}(d) = \\frac{\\sum_{t \\in q ∩ d} \\mathrm{idf}(t)}{\\sum_{t \\in q} \\mathrm{idf}(t)}',
            caption: 'An intent’s score: the share of the question’s weight it covers. Ties go to the earlier intent in the file.' },
          { p: 'For the timesheet question the winner is {{kb-top|Workday queries}} at {{kb-score|0.439}}. That is a fair answer. Timesheets live in Workday there, and the matcher found that through the word "timesheet" alone.' },
          { widget: 'matcher', size: 'wide', caption: 'Your question, tokenised the way the worker does it, scored against the 330 intents. Chip size is the word’s weight; greyed chips are stopwords or under three letters. The dashed rule is the 0.30 threshold. Token sets ship without utterances or answers; 84 tokens naming people, internal hosts, ticket IDs or internal codenames were removed, so a question containing one of those scores slightly differently from the original.' },
          { callout: 'Try "my vpn keeps dropping". It goes to BluetoothIssue, with a score of 0.469. "keeps" appears in only 6 intents and "vpn" in 9, so the filler word outweighs the subject. "I tried that but it still shows an error" scores 0.777 for a vSphere intent, because "but" was never a stopword.\n\nBoth clear my threshold comfortably. The matcher is not uncertain about these; it is confidently wrong, and a threshold can’t catch that.', label: 'Confident and wrong' },
          { p: 'I found these by re-running my own code over its own data months later. The toggles in the figure are the first fix I’d reach for: treat "but" and "keeps" as filler. That fixes these two questions, but it does not fix the cause. On 330 short documents, rarity is a weak signal for meaning.' }
        ]
      },
      {
        id: 'llm', label: 'Rung 3 · LLM', title: 'The sentence that never changed',
        blocks: [
          { p: 'When the user presses "Try another solution", the question goes to rung 3, a language model. The provider is a setting: Claude on Bedrock by default, through the fallback Lambda my teammate wrote, or Mistral, or Gemini. Rung 3 is the first rung that can make something up, so it is the one that needs the most rules.' },
          { p: 'The fallback’s original prompt told the model to ask one clarifying question when a request was ambiguous. In a helpdesk, a clarifying question is often a dead end. So when I wired it into the ladder I rewrote the prompt to lead with the most likely fix, raised the answer budget from 500 to 800 tokens, and moved the call to Bedrock’s model-agnostic Converse API.^[git blame on lambda_o3_claude_fallback.py: lines 13 and 18–22 are mine (5a4e40e, 2026-07-27); the original prompt is at 61fe183.]' },
          { code: '"You are IVY, an IT and support assistant. "\n"Give a clear, concrete, step-by-step solution the user can act on right away, "\n"using short numbered steps and leading with the most likely fix. "\n"Only ask a clarifying question if you genuinely cannot give any useful "\n"guidance without more detail; otherwise provide the best actionable steps. "\n"Do not claim that a ticket was created."', lang: 'python',
            caption: 'The rewritten system prompt, lambda_o3_claude_fallback.py at bbdf83a. The last line is the one line I kept from the original.' },
          { p: 'The last sentence is the one that never moved: *Do not claim that a ticket was created.* The model may be helpful, but only the deterministic code is allowed to say that something happened.',
            notes: [['only the deterministic code is allowed to say that something happened', 'the whole safety argument, in one rule']] },
          { p: 'Once the ladder reaches rung 3, the conversation stays there. Follow-ups go to the model with the original issue and a transcript, for up to 50 turns. The transcript is cut to its last 6,000 characters, so a long chat forgets its beginning before it can outgrow the prompt. At turn 50, IVY says "We’ve gone back and forth quite a few times" and offers a person.^[LLM_CHAT_MAX_MESSAGES = 50 and LLM_CHAT_HISTORY_MAX_CHARS = 6000, lambda_o3_slack_worker.py lines 167–176.]' }
        ]
      },
      {
        id: 'human', label: 'Rung 4 · A human', title: 'Handing off to code I didn’t write',
        blocks: [
          { p: 'The bottom rung is a button, "Talk to a support agent". My code draws it and sets the session state its handler needs. What happens after the press is my teammate’s work, and it is the most carefully built part of IVY.' },
          { p: 'His dispatcher picks the least-loaded agent who is enabled and on call or on shift. It reserves that agent with a conditional write that only succeeds while the agent has fewer than 5 open chats. If two requests race for the same person, one write fails and that request moves on to the next agent. If nobody has room, the ticket queues instead of being forced onto someone.^[live_agent_capacity.py, 1,392 of 1,392 lines by a teammate; MAX_ACTIVE_CHATS_PER_AGENT defaults to 5.]' },
          { callout: 'An earlier version of this case study described that dispatcher, and the ticket lock, in the first person. That was wrong. They are a teammate’s, and so are the seven test files it cited.', label: 'Correction' }
        ]
      },
      {
        id: 'screenshots', label: 'Side door', title: '“Half of tickets are a picture”',
        art: function (c) {
          return '<rect x="30" y="24" width="100" height="70" rx="6" fill="none" stroke="' + c.l + '"/>' +
            '<rect x="30" y="24" width="100" height="14" fill="' + c.m + '"/>' +
            '<line x1="42" y1="56" x2="110" y2="56" stroke="' + c.i + '"/><line x1="42" y1="70" x2="96" y2="70" stroke="' + c.a + '" stroke-dasharray="3 2"/>';
        },
        blocks: [
          { p: 'That line is from the demo script, not a measurement; I never counted. It is true often enough, though. People paste a screenshot of the error dialog and type nothing else. With the ladder on, the text read off the picture goes to Lex first and then down the same rungs as typed text. A screenshot is just another question.' },
          { p: 'Reading it means picking an OCR engine. I scored four of them against transcriptions I typed by hand, using a plain edit distance: one minus the number of character edits divided by the length of the truth. The test set was five synthetic cards rendered for the purpose, one of them a timesheet error.^[ocr/metrics.py and ocr/ground_truth.py at 61fe183. Results generated 2026-07-17.]',
            notes: [['five synthetic cards', 'clean rendered text, so 100% here is easy']] },
          { figure: 'public/assets/projects/ivy-timesheet-card.webp', alt: 'A synthetic error card: TimeTrack Portal, Timesheet submission failed, Error: Timesheet period is locked for payroll processing, Employee: Test User.', caption: 'One of the five test cards, synthetic, made for the benchmark. Every card has a footer saying so.', size: 'column' },
          { widget: 'ocr', size: 'wide', caption: 'Each engine’s real output on two of the cards, diffed against the ground truth in your browser with the same edit distance as ocr/metrics.py. Below that, a model of a cold Lambda: model load plus N images times the mean latency, from the benchmark. It is arithmetic on measured numbers, not a measurement of a deployed function.' },
          { p: 'Accuracy barely separated them. Mistral OCR read all five cards perfectly and Textract scored 99.9%. The difference was cost at start-up. PaddleOCR took 10.6 seconds to load its model and EasyOCR 12.1. On Lambda, a new container pays that every time it scales out. With {{n|10}} screenshots per container, the cheapest engine to wait on is {{lead|Mistral OCR}}.' },
          { p: 'I still packaged PaddleOCR, because it costs nothing per call. Its libraries are far over Lambda’s 250 MB zip limit, so it ships as a container image. The model weights are baked in at build time, because at runtime only `/tmp` is writable and it starts empty. Under the local Lambda emulator, a cold call took 4.3 seconds and warm calls about one.^[ocr/Dockerfile and ocr/DEPLOY.md at 61fe183. Nothing in the repo shows the image deployed to AWS.]' },
          { p: 'That container was an experiment, and it never went further than the emulator. In a later commit I deleted the benchmark and three of the engines. IVY’s OCR is Textract, and the extracted text goes to Mistral when it needs an LLM.^[Commit 5a4e40e: ocr/registry.py lists only textract; IMAGE_LLM_PROVIDER defaults to mistral.]' }
        ]
      },
      {
        id: 'loop', label: 'Coda · The learning loop', title: 'A closed ticket becomes a rung',
        blocks: [
          { p: 'The ladder only helps if the top rungs keep learning. So the last thing I built turns resolved Jira tickets into new Lex intents, with a person approving each batch in Slack.' },
          { list: [
            '`/generate-intents` pulls resolved tickets. One LLM call per ticket, at temperature 0, distils each into a request, a resolution, a category and the user’s phrasings.',
            'Within each category, requests are clustered greedily by word overlap (Jaccard), with a threshold of 0.3.',
            'The LLM names each cluster, but the utterances stay the users’ real phrasings, up to 40 per intent. The part Lex matches on is never generated.',
            'A card in Slack lists the proposals with **Approve & load** and **Deny (get CSV)**. Approve loads them into Lex through the dedupe above.'
          ], ordered: true },
          { p: 'The sample run has four tickets, and two of them are about Smartsheet. The comments promise three intents from four tickets. Whether that happens depends on one sentence the LLM writes. "Get access to Smartsheet" and "Get a Smartsheet license for planning" share one word out of four, a Jaccard of {{jac|0.25}}. At 0.3 they stay apart, and the card proposes {{clusters|4}} intents.^[Production mock wording in lambda_o3_intents.py lines 131–149; the demo wording in demo/slack_intents_demo.py scores 0.50. Both computed with agents.synthesize.cluster_interactions.]',
            notes: [['depends on one sentence the LLM writes', 'a knife edge I didn’t see until I measured it']] },
          { widget: 'loop', size: 'wide', caption: 'The four sample tickets (SUP-1001 to 1004, synthetic, from agents/connectors.py), clustered with the real algorithm. Move the threshold and switch the wording of SUP-1004. The first three names are the mock run’s canned labels; a fourth cluster falls back to a name built from its words, as the code does when the label queue runs dry. Approve adds the proposals to the matcher above, in this page only.' },
          { p: 'Press Approve and scroll back up to the matcher. "my vpn keeps dropping" now goes to VpnDisconnecting, because that is exactly how the person in SUP-1002 put it. The mock data is that convenient on purpose, but the loop works the same way with real tickets: a question that needed a person last week can be answered by the ladder this week.' }
        ]
      }
    ],

    closing: {
      blocks: [
        { p: '**Score the routing, not just the OCR.** I measured what was easy to measure, characters on a clean card. The part that decides whether IVY helps is whether a question lands on the right intent, and "vpn keeps dropping" going to Bluetooth shows I never checked. A hundred real requests, each labelled with the intent it should reach, would have caught it in an afternoon.' },
        { p: '**Make the matcher earn a hit.** A 0.30 share of the weight can be all filler. I would require the single heaviest matched word to be a real subject word, or move to embeddings. The clustering already has a `similarity_fn` hook waiting for that.' },
        { p: '**Test against real screenshots.** On synthetic cards, two engines tie at the top and the benchmark can’t tell them apart. I also deleted the harness when I chose Textract, which left the Dockerfile still saying `OCR_ENGINE=paddleocr`. I’d keep the harness and fix that line.' },
        { p: '**Test the card I ship.** One of my 39 tests still expects an Edit button that the review card no longer has, and it fails. A learning loop that adds answers to a bot needs its approval step tested more strictly than anything else.' },
        { p: '**Turn the ladder on somewhere real.** It is off by default, and nothing in the repo shows it ran for real users. Everything here is how it decides, not how often it helped.' }
      ]
    },

    sources: [
      ['Authorship', 'git blame --line-porcelain per file at bbdf83a (local clone); commit counts from git shortlog --all. My commits run 2026-07-13 to 2026-08-10.'],
      ['Ladder', 'lambda_o3_slack_worker.py lines 148–176, 1396–1587, 5330–5390, 7675–7733: ESCALATION_LEVELS, ESCALATION_MAX_QUERY_CHARS = 1500, ENABLE_ESCALATION_LADDER default false, LLM_CHAT_MAX_MESSAGES = 50, LLM_CHAT_HISTORY_MAX_CHARS = 6000.'],
      ['Lex intents', 'data/lex_full_export_preview.json: 333 intents, 65 Lambda-backed.'],
      ['Knowledge base', 'data/intent_kb.json: 330 intents, 2,672 utterances, 13 categories; matcher lambda_o3_slack_worker.py lines 2847–2973, LOCAL_KB_MIN_SCORE = 0.30. Scores (Workday queries 0.439, BluetoothIssue 0.469, VsphereorVcloudIssues 0.777, idf pcq 6.11, access 1.79) re-run over the file in October 2026 with a mirror of invoke_local_kb.'],
      ['Dedupe', 'load_lex_intents_from_excel.py lines 335–356 run read-only over data/intent_kb.json under each ordering: 2,615 distinct of 2,672, 54 shared strings, 57 removals; 4, 12 and 13 intents emptied; ApplicationLicenses 51 → 23.'],
      ['Fallback prompt', 'lambda_o3_claude_fallback.py at 61fe183 (original, max tokens 500) and bbdf83a (rewrite in 5a4e40e, max tokens 800, Converse API).'],
      ['Dispatcher', 'live_agent_capacity.py (a teammate’s), MAX_ACTIVE_CHATS_PER_AGENT = 5.'],
      ['OCR', 'ocr/results/result-*.json and benchmark_results.md at 61fe183, generated 2026-07-17: char accuracy 97.4 / 98.9 / 99.9 / 100%, mean latency 2,184 / 1,075 / 1,551 / 823 ms, load 12,142 / 10,594 / 38 / 1,420 ms (EasyOCR / PaddleOCR / Textract / Mistral OCR). Cold container 4,280.5 ms: ocr/DEPLOY.md. Crossovers are arithmetic on those means.'],
      ['Learning loop', 'agents/ingest.py, synthesize.py (threshold 0.3, 40 utterances), store.py (7-day TTL), review.py; lambda_o3_intents.py. Jaccard 0.25 vs 0.50 and the 4-cluster result re-run with agents.synthesize.cluster_interactions and MockLLMClient.'],
      ['Tests', 'python -m pytest tests, 2026-10-16: tests/test_agents_*.py 38 passed, 1 failed.']
    ],

    widgets: {
      /* ---- rail: the question, and what each rung does with it ---- */
      ask: function (host, kit) {
        var id = kit.id('q');
        var input = kit.el('input', { type: 'text', id: id, class: 'iv-ask__in', value: ASK.q, maxlength: '300', autocomplete: 'off' });
        host.appendChild(kit.el('label', { 'for': id, class: 'iv-ask__k', text: 'Ask IVY something' }));
        host.appendChild(input);
        var list = kit.el('ol', { class: 'iv-gauge' });
        host.appendChild(list);
        var RUNGS = [['lex', 'L1', 'Lex'], ['kb', 'L2', 'Knowledge base'], ['llm', 'L3', 'LLM'], ['human', 'L4', 'A human']];
        var items = RUNGS.map(function (r) {
          var v = kit.el('span', { class: 'iv-gauge__v' });
          var li = kit.el('li', { class: 'iv-gauge__r', 'data-ch': r[0] },
            kit.el('span', { class: 'iv-gauge__n', text: r[1] }), kit.el('span', { class: 'iv-gauge__t', text: r[2] }), v);
          list.appendChild(li);
          return { li: li, v: v, ch: r[0] };
        });
        var chars = kit.el('p', { class: 'iv-gauge__foot' });
        host.appendChild(chars);
        function update() {
          var m = match(ASK.q);
          items[0].v.textContent = 'runs in AWS; not simulated here';
          items[1].v.textContent = m.best ? (m.best.score >= MIN ? m.best.name + ' · ' + f3(m.best.score) : 'below 0.30 · miss') : 'no match';
          items[2].v.textContent = 'always available';
          items[3].v.textContent = 'a teammate’s dispatcher';
          chars.textContent = 'The button carries ' + Math.min(ASK.q.length, 1500) + ' of 1,500 characters.';
        }
        input.addEventListener('input', function () { ASK.set(input.value, 'rail'); });
        ASK.on(function (src) { if (src !== 'rail') input.value = ASK.q; update(); });
        kit.onChapter(function (ch) {
          items.forEach(function (it) { it.li.classList.toggle('is-on', it.ch === ch); });
        });
        update();
      },

      /* ---- the ownership strip ---- */
      owners: function (host, kit) {
        var them = 0, me = 0, max = 0;
        OWN.forEach(function (r) { them += r[1]; me += r[2]; max = Math.max(max, r[1] + r[2]); });
        var focus = null;
        var bT = kit.el('button', { type: 'button', class: 'iv-tot__seg iv-them', 'aria-pressed': 'false',
          style: { flexGrow: String(them) } }, 'a teammate · ' + kit.fmt(them) + ' lines');
        var bM = kit.el('button', { type: 'button', class: 'iv-tot__seg iv-me', 'aria-pressed': 'false',
          style: { flexGrow: String(me) } }, 'me · ' + kit.fmt(me));
        host.appendChild(kit.el('div', { class: 'iv-tot', role: 'group', 'aria-label': 'Lines by author' }, bT, bM));
        var rows = kit.el('ul', { class: 'iv-own' });
        OWN.forEach(function (r) {
          var bar = kit.el('span', { class: 'iv-own__bar', style: { width: ((r[1] + r[2]) / max * 100).toFixed(2) + '%' } },
            r[1] ? kit.el('span', { class: 'iv-them', style: { flexGrow: String(r[1]) } }) : null,
            r[2] ? kit.el('span', { class: 'iv-me', style: { flexGrow: String(r[2]) } }) : null);
          rows.appendChild(kit.el('li', { class: 'iv-own__row', title: r[3] },
            kit.el('span', { class: 'iv-own__f', text: r[0] }),
            kit.el('span', { class: 'iv-own__track' }, bar),
            kit.el('span', { class: 'iv-own__n', text: (r[1] ? kit.fmt(r[1]) : '–') + ' / ' + (r[2] ? kit.fmt(r[2]) : '–') })));
        });
        host.appendChild(rows);
        host.appendChild(kit.el('p', { class: 'iv-key', text: 'File · lines (a teammate / me)' }));
        function show(k) {
          host.setAttribute('data-focus', k || '');
          bT.setAttribute('aria-pressed', String(k === 'them'));
          bM.setAttribute('aria-pressed', String(k === 'me'));
        }
        bT.addEventListener('click', function () { focus = focus === 'them' ? null : 'them'; show(focus); });
        bM.addEventListener('click', function () { focus = focus === 'me' ? null : 'me'; show(focus); });
        kit.onKey(function (k) { show(k === 'them' || k === 'me' ? k : focus); });
      },

      /* ---- the ladder, as a scrolly ---- */
      ladder: function (host, kit) {
        var st = { at: 0, ladder: true, kb: true, lex: false };
        function box(label, key) {
          var cb = kit.el('input', { type: 'checkbox' });
          cb.addEventListener('change', function () { st[key] = cb.checked; st.at = Math.min(st.at, 1); draw(); });
          return { el: kit.el('label', { class: 'iv-flag' }, cb, ' ' + label), cb: cb, key: key };
        }
        var flags = [box('ENABLE_ESCALATION_LADDER', 'ladder'), box('knowledge base provisioned', 'kb'), box('Lex answers', 'lex')];
        var next = kit.button('Press the button', function () { st.at++; draw(); }, 'k-btn--primary');
        var reset = kit.button('Start again', function () { st.at = 0; draw(); });
        host.appendChild(kit.el('div', { class: 'k-row iv-flags' }, flags.map(function (f) { return f.el; })));
        var rungs = kit.el('ol', { class: 'iv-ladder' });
        host.appendChild(rungs);
        var say = kit.el('div', { class: 'iv-say', 'aria-live': 'polite' });
        host.appendChild(say);
        host.appendChild(kit.el('div', { class: 'k-row' }, next, reset));
        var NAMES = [['pipe', '·', 'Slack → handler → SQS → worker', 'a teammate’s'],
          ['lex', 'L1', 'Lex V2', ''], ['kb', 'L2', 'Knowledge base', 'mine'], ['llm', 'L3', 'LLM', 'prompt mine'], ['human', 'L4', 'A human', 'a teammate’s']];

        // The sequence of events the worker produces for these flags.
        function trace() {
          var ev = [{ r: 'pipe', t: 'Deduplicated by event_id, queued on SQS, picked up by the worker.' }];
          if (!st.ladder) {
            ev.push({ r: 'lex', t: st.lex ? 'Lex answers.' : 'Lex misses. The ladder is off, so the original path runs, with no ladder buttons.' });
            return ev;
          }
          if (st.lex) ev.push({ r: 'lex', t: 'Lex’s answer, with a button.', b: st.kb ? 'Explore Knowledge base' : 'Try another solution' });
          else if (st.kb) ev.push({ r: 'lex', t: '“I couldn’t find a direct answer for that. Want me to search the knowledge base?”', b: 'Explore Knowledge base' });
          else ev.push({ r: 'lex', t: 'No knowledge base, so nothing to offer: the worker moves on by itself.', skip: true });
          if (st.kb) {
            var m = match(ASK.q);
            var hit = m.best && m.best.score >= MIN;
            ev.push({ r: 'kb', t: hit ? 'Matched “' + m.best.name + '” at ' + f3(m.best.score) + ', and shows that intent’s answer.'
              : '“I couldn’t find anything specific in the knowledge base for this. Want me to try our AI assistant?”', b: 'Try another solution' });
          }
          ev.push({ r: 'llm', t: 'An LLM answer (not called here). From now on follow-ups stay with the model, up to 50 turns.', b: 'Talk to a support agent' });
          ev.push({ r: 'human', t: 'Handed to a teammate’s dispatcher: an on-shift agent with room, or the queue.' });
          return ev;
        }
        function draw() {
          flags.forEach(function (f) { f.cb.checked = st[f.key]; });
          var ev = trace(), at = Math.min(st.at, ev.length - 1), cur = ev[at];
          var seen = {}; ev.slice(0, at + 1).forEach(function (e) { seen[e.r] = 1; });
          var inTrace = {}; ev.forEach(function (e) { inTrace[e.r] = 1; });
          rungs.textContent = '';
          NAMES.forEach(function (n) {
            var off = n[0] === 'kb' && (!st.kb || !st.ladder);
            rungs.appendChild(kit.el('li', { class: 'iv-rung' + (cur.r === n[0] ? ' is-here' : '') + (seen[n[0]] ? ' is-seen' : '') + (off ? ' is-off' : '') },
              kit.el('span', { class: 'iv-rung__n', text: n[1] }),
              kit.el('span', { class: 'iv-rung__t', text: n[2] + (off ? ' — not provisioned, skipped' : '') }),
              kit.el('span', { class: 'iv-rung__o', text: n[3] }),
              kit.el('span', { class: 'iv-rung__m', 'aria-hidden': 'true', text: cur.r === n[0] ? '◀' : '' })));
          });
          say.textContent = '';
          say.appendChild(kit.el('p', { class: 'iv-say__t', text: cur.t }));
          if (cur.b) say.appendChild(kit.el('span', { class: 'iv-say__b', text: cur.b }));
          next.disabled = at >= ev.length - 1;
          st.at = at;
        }
        ASK.on(draw);
        draw();
        return { set: function (s) { for (var k in s) st[k] = s[k]; draw(); } };
      },

      /* ---- who keeps the utterance ---- */
      tug: function (host, kit) {
        var rule = 'small';
        var ch = kit.choice({ label: 'Rule', value: rule, options: Object.keys(RULES).map(function (k) { return { value: k, label: RULES[k].label }; }),
          onChange: function (v) { rule = v; draw(); } });
        host.appendChild(kit.el('div', { class: 'k-row' }, ch.el));
        var board = kit.el('div', { class: 'iv-tug' });
        host.appendChild(board);
        var foot = kit.el('div', { class: 'k-row' });
        host.appendChild(foot);
        var rRem = kit.readout('Removed, whole export', '57'), rEmp = kit.readout('Intents emptied', '4', 'k-readout--accent'), rAl = kit.readout('ApplicationLicenses keeps', '23');
        foot.appendChild(rRem.el); foot.appendChild(rEmp.el); foot.appendChild(rAl.el);
        function chip(s) {
          return kit.el('li', { class: 'iv-chip' + (s ? '' : ' iv-chip--x'), text: s || 'withheld' });
        }
        function draw() {
          var specificKeeps = rule === 'small';
          board.textContent = '';
          var alShared = [];
          var cols = SHARED.map(function (s) {
            if (!specificKeeps) alShared = alShared.concat(s[1]);
            var ul = kit.el('ul', { class: 'iv-tug__chips' });
            if (specificKeeps) s[1].forEach(function (u) { ul.appendChild(chip(u)); });
            return kit.el('div', { class: 'iv-tug__col' + (specificKeeps ? '' : ' is-empty') },
              kit.el('p', { class: 'iv-tug__h' }, s[0], kit.el('b', { text: ' ' + (specificKeeps ? s[1].length : 0) })),
              specificKeeps ? ul : kit.el('p', { class: 'iv-tug__gone', text: 'emptied — Lex prunes it' }));
          });
          var alUl = kit.el('ul', { class: 'iv-tug__chips' });
          alShared.forEach(function (u) { alUl.appendChild(chip(u)); });
          var al = 23 + alShared.length;
          board.appendChild(kit.el('div', { class: 'iv-tug__col iv-tug__col--al' },
            kit.el('p', { class: 'iv-tug__h' }, 'ApplicationLicenses', kit.el('b', { text: ' ' + al })),
            kit.el('p', { class: 'iv-tug__own', text: '23 phrasings no other intent has (not shown)' }), alUl));
          var right = kit.el('div', { class: 'iv-tug__specific' });
          cols.forEach(function (c) { right.appendChild(c); });
          board.appendChild(right);
          rEmp.set(String(RULES[rule].emptied));
          rAl.set(String(al));
          kit.live('al-count', String(al));
          kit.announce(RULES[rule].label + ': ApplicationLicenses keeps ' + al + ', ' + RULES[rule].emptied + ' intents emptied.');
        }
        kit.onKey(function (k) { board.classList.toggle('is-al', k === 'al'); });
        draw();
      },

      /* ---- the IDF matcher ---- */
      matcher: function (host, kit) {
        var id = kit.id('mq');
        var input = kit.el('input', { type: 'text', id: id, class: 'iv-ask__in', value: ASK.q, maxlength: '300', autocomplete: 'off' });
        host.appendChild(kit.el('label', { 'for': id, class: 'iv-ask__k', text: 'Your question (the same one as in “Ask IVY something”)' }));
        host.appendChild(input);
        var PRE = [['Timesheet', 'My timesheet won’t submit and the deadline is in an hour'],
          ['ADAM reset', 'How do I reset my ADAM account password?'], ['PCQ', 'Error: You do not have access to PCQ'],
          ['vpn keeps dropping', 'my vpn keeps dropping'], ['“but”', 'I tried that but it still shows an error']];
        var pre = kit.el('div', { class: 'k-row iv-pre' }, kit.el('span', { class: 'k-choice__label', text: 'Try' }));
        PRE.forEach(function (p) { pre.appendChild(kit.button(p[0], function () { input.value = p[1]; ASK.set(p[1], 'matcher'); })); });
        host.appendChild(pre);
        var extra = {};
        var fixes = kit.el('div', { class: 'k-row' });
        ['but', 'keeps'].forEach(function (w) {
          var cb = kit.el('input', { type: 'checkbox' });
          cb.addEventListener('change', function () { extra[w] = cb.checked; draw(); });
          fixes.appendChild(kit.el('label', { class: 'iv-flag' }, cb, ' make “' + w + '” a stopword'));
        });
        host.appendChild(fixes);
        var chips = kit.el('div', { class: 'iv-tok', 'aria-hidden': 'true' });
        host.appendChild(chips);
        var bars = kit.el('ol', { class: 'iv-bars' });
        host.appendChild(bars);
        var verdict = kit.el('p', { class: 'iv-verdict', 'aria-live': 'polite' });
        host.appendChild(verdict);
        var hl = null;
        function draw() {
          var m = match(ASK.q, extra);
          chips.textContent = '';
          (String(ASK.q).match(/[A-Za-z0-9]+/g) || []).forEach(function (w) {
            var lw = w.toLowerCase();
            var t = m.tokens.filter(function (x) { return x.t === lw; })[0];
            var c = kit.el('span', { class: 'iv-tok__c' + (t ? '' : ' is-drop') + (hl && lw === hl ? ' is-hl' : ''), text: w });
            if (t) { c.style.fontSize = (11 + t.idf * 2.4).toFixed(1) + 'px'; c.title = 'idf ' + t.idf.toFixed(2) + ', in ' + t.df + ' intents'; }
            chips.appendChild(c);
          });
          bars.textContent = '';
          m.top.forEach(function (r, i) {
            bars.appendChild(kit.el('li', { class: 'iv-bar' + (i === 0 && r.score >= MIN ? ' is-win' : '') + (r.extra ? ' is-new' : '') },
              kit.el('span', { class: 'iv-bar__n', text: r.name + (r.extra ? ' (approved below)' : '') }),
              kit.el('span', { class: 'iv-bar__track' }, kit.el('span', { class: 'iv-bar__fill', style: { width: (r.score * 100).toFixed(1) + '%' } }),
                kit.el('span', { class: 'iv-bar__rule' })),
              kit.el('span', { class: 'iv-bar__v', text: f3(r.score) })));
          });
          var b = m.best;
          var txt = !m.tokens.length ? 'No words left after the stopwords: the KB rung returns nothing.'
            : !b ? 'Nothing shares a word with this question: a miss.'
            : b.score >= MIN ? 'Hit: ' + b.name + ' (' + b.cat + ') at ' + f3(b.score) + '.'
            : 'Best is ' + b.name + ' at ' + f3(b.score) + ', under 0.30: a miss, so the user is offered the LLM.';
          verdict.textContent = txt;
          kit.live('kb-top', b ? b.name : 'nothing');
          kit.live('kb-score', b ? f3(b.score) : '0');
        }
        input.addEventListener('input', function () { ASK.set(input.value, 'matcher'); });
        ASK.on(function (src) { if (src !== 'matcher') input.value = ASK.q; draw(); });
        kit.onKey(function (k) { hl = k; draw(); });
        draw();
      },

      /* ---- OCR diff + cold-start arithmetic ---- */
      ocr: function (host, kit) {
        var eng = 'easyocr', card = 'pcq';
        var row = kit.el('div', { class: 'k-row' });
        row.appendChild(kit.choice({ label: 'Engine', value: eng, options: ENG.map(function (e) { return { value: e.id, label: e.label }; }),
          onChange: function (v) { eng = v; draw(); } }).el);
        row.appendChild(kit.choice({ label: 'Card', value: card, options: [{ value: 'pcq', label: 'PCQ access denied' }, { value: 'ts', label: 'Timesheet' }],
          onChange: function (v) { card = v; draw(); } }).el);
        host.appendChild(row);
        var out = kit.el('pre', { class: 'iv-diff' });
        host.appendChild(out);
        var rd = kit.el('div', { class: 'k-row' });
        var rA = kit.readout('Character accuracy', '', 'k-readout--accent'), rE = kit.readout('Edits', '');
        rd.appendChild(rA.el); rd.appendChild(rE.el);
        rd.appendChild(kit.el('span', { class: 'iv-key', text: 'struck = missing from the output · underlined = added by the engine' }));
        host.appendChild(rd);
        function draw() {
          var ref = normWs(GT[card].join('\n')), pred = normWs(PRED[eng][card].join('\n'));
          var d = diff(pred, ref);
          out.textContent = '';
          var buf = '', mode = '=';
          function flush() {
            if (!buf) return;
            out.appendChild(mode === '=' ? document.createTextNode(buf) : kit.el(mode === '-' ? 'del' : 'ins', { text: buf }));
            buf = '';
          }
          d.ops.forEach(function (o) {
            var parts = o[0] === '~' ? [['-', o[2]], ['+', o[1]]] : o[0] === '=' ? [['=', o[1]]] : o[0] === '+' ? [['+', o[1]]] : [['-', o[2]]];
            parts.forEach(function (p) { if (p[0] !== mode) { flush(); mode = p[0]; } buf += p[1]; });
          });
          flush();
          var acc = Math.max(0, 1 - d.dist / ref.length) * 100;
          rA.set(acc.toFixed(1) + '%');
          rE.set(d.dist + ' of ' + ref.length + ' characters');
        }
        draw();

        host.appendChild(kit.el('h4', { class: 'iv-sub', text: 'Time to read N screenshots on one cold container' }));
        var table = kit.el('ol', { class: 'iv-bars iv-cold' });
        var lead = kit.el('p', { class: 'iv-verdict', 'aria-live': 'polite' });
        var s = kit.slider({ label: 'N per container', min: 1, max: 50, step: 1, value: 10,
          format: function (v) { return String(v); }, onInput: function () { cold(); } });
        host.appendChild(kit.el('div', { class: 'k-row' }, s.el));
        host.appendChild(table);
        host.appendChild(lead);
        function cold() {
          var n = s.value();
          var tot = ENG.map(function (e) { return { e: e, ms: e.load + n * e.lat }; });
          var mx = Math.max.apply(null, tot.map(function (t) { return t.ms; }));
          var best = tot.slice().sort(function (a, b) { return a.ms - b.ms; })[0];
          table.textContent = '';
          tot.forEach(function (t) {
            table.appendChild(kit.el('li', { class: 'iv-bar' + (t === best ? ' is-win' : '') },
              kit.el('span', { class: 'iv-bar__n', text: t.e.label + (t === best ? ' — fastest' : '') }),
              kit.el('span', { class: 'iv-bar__track' },
                kit.el('span', { class: 'iv-bar__load', style: { width: (t.e.load / mx * 100).toFixed(2) + '%' } }),
                kit.el('span', { class: 'iv-bar__fill', style: { width: (n * t.e.lat / mx * 100).toFixed(2) + '%' } })),
              kit.el('span', { class: 'iv-bar__v', text: (t.ms / 1000).toFixed(1) + ' s' })));
          });
          var px = ENG[1], tx = ENG[2];
          lead.textContent = 'Light segment = model load, dark = N × mean latency. PaddleOCR only beats Textract from N = ' +
            (Math.floor((px.load - tx.load) / (tx.lat - px.lat)) + 1) + '; Mistral OCR beats Textract from N = 2 and never loses after that.';
          kit.live('n', String(n));
          kit.live('lead', best.e.label);
        }
        cold();
      },

      /* ---- the learning loop ---- */
      loop: function (host, kit) {
        var th = 0.3, wording = 'mock', approved = false;
        var s = kit.slider({ label: 'Threshold', min: 0, max: 1, step: 0.05, value: th,
          format: function (v) { return v.toFixed(2); }, onInput: function (v) { th = v; draw(); } });
        var w = kit.choice({ label: 'SUP-1004 wording', value: wording,
          options: [{ value: 'mock', label: 'production mock' }, { value: 'demo', label: 'demo script' }],
          onChange: function (v) { wording = v; draw(); } });
        host.appendChild(kit.el('div', { class: 'k-row' }, s.el, w.el));
        var lanes = kit.el('div', { class: 'iv-lanes' });
        host.appendChild(lanes);
        var card = kit.el('div', { class: 'iv-card' });
        host.appendChild(card);
        var res = kit.el('p', { class: 'iv-verdict', 'aria-live': 'polite' });
        host.appendChild(res);
        function items() {
          return TICKETS.map(function (t) {
            return { id: t.id, cat: t.cat, summary: t.summary, request: typeof t.req === 'string' ? t.req : t.req[wording], ph: t.ph };
          });
        }
        function draw() {
          var its = items(), cl = cluster(its, th);
          var a = synTok(its[2].request), b = synTok(its[3].request), j = jac(a, b);
          lanes.textContent = '';
          cl.forEach(function (c, i) {
            var box = kit.el('div', { class: 'iv-cl' + (c.items.length > 1 ? ' is-merged' : '') },
              kit.el('p', { class: 'iv-cl__h', text: label(c, i) + ' · ' + c.cat }));
            c.items.forEach(function (it) {
              var toks = kit.el('span', { class: 'iv-cl__toks' });
              Object.keys(synTok(it.request)).forEach(function (k) {
                toks.appendChild(kit.el('span', { class: 'iv-chip' + ((it.id === 'SUP-1003' || it.id === 'SUP-1004') && a[k] && b[k] ? ' is-shared' : ''), text: k }));
              });
              box.appendChild(kit.el('div', { class: 'iv-tk' },
                kit.el('span', { class: 'iv-tk__id', text: it.id }), kit.el('span', { class: 'iv-tk__r', text: '“' + it.request + '”' }), toks));
            });
            lanes.appendChild(box);
          });
          card.textContent = '';
          card.appendChild(kit.el('p', { class: 'iv-card__t', text: cl.length + ' proposed intent(s) from 4 tickets' }));
          var ul = kit.el('ul', { class: 'iv-card__l' });
          cl.forEach(function (c, i) { ul.appendChild(kit.el('li', { text: label(c, i) + ' — ' + c.items.length + ' ticket(s)' })); });
          card.appendChild(ul);
          var ap = kit.button(approved ? 'Approved' : 'Approve & load', function () {
            ASK.extra = cl.map(function (c, i) {
              var set = {};
              var blob = [label(c, i), c.cat].concat([].concat.apply([], c.items.map(function (x) { return x.ph; }))).join(' ');
              tokens(blob).forEach(function (t) { set[t] = 1; });
              return { name: label(c, i), cat: c.cat, set: set, extra: true };
            });
            approved = true;
            var m = match('my vpn keeps dropping');
            res.textContent = 'Loaded ' + cl.length + ' intents. In the matcher above, “my vpn keeps dropping” now goes to ' + m.best.name + ' at ' + f3(m.best.score) + ' (it went to BluetoothIssue at 0.469).';
            ASK.set(ASK.q, 'loop');
            draw();
          }, 'k-btn--primary');
          ap.disabled = approved;
          var dn = kit.button('Deny (get CSV)', function () { res.textContent = 'Denied: the proposals would come back to you as a CSV file in Slack. Nothing is loaded.'; });
          var undo = approved ? kit.button('Undo', function () { ASK.extra = []; approved = false; res.textContent = ''; ASK.set(ASK.q, 'loop'); draw(); }) : null;
          card.appendChild(kit.el('div', { class: 'k-row' }, ap, dn, undo));
          kit.live('jac', j.toFixed(2));
          kit.live('clusters', String(cl.length));
          kit.announce('Jaccard ' + j.toFixed(2) + ' between the Smartsheet requests; ' + cl.length + ' intents at threshold ' + th.toFixed(2));
        }
        draw();
      }
    }
  });
})();
