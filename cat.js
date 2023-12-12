const BC_VER=1300005;var fandom,unit_buy,skill_file,SkillLevel,anim1,_eggs,enemy_descs,obtainid,rwMap,tfMap,def_lv,plus_lv,my_curve,_info,unit_orbs,orb_massive=0,orb_resist=1,orb_good_atk=0,orb_good_hp=1;const ATK_SINGLE=1,ATK_RANGE=2,ATK_LD=4,ATK_OMNI=8,ATK_KB_REVENGE=16,TB_RED=1,TB_FLOAT=2,TB_BLACK=4,TB_METAL=8,TB_ANGEL=16,TB_ALIEN=32,TB_ZOMBIE=64,TB_RELIC=128,TB_WHITE=256,TB_EVA=512,TB_WITCH=1024,TB_DEMON=2048,TB_INFN=4096,TB_BEAST=8192,TB_BARON=16384,IMU_WAVE=1,IMU_STOP=2,IMU_SLOW=4,IMU_KB=8,IMU_VOLC=16,IMU_WEAK=32,IMU_WARP=64,IMU_CURSE=128,IMU_POIATK=256,IMU_BOSSWAVE=512,AB_STRONG=1,AB_LETHAL=2,AB_ATKBASE=3,AB_CRIT=4,AB_ZKILL=5,AB_CKILL=6,AB_BREAK=7,AB_SHIELDBREAK=8,AB_S=9,AB_BOUNTY=10,AB_METALIC=11,AB_MINIWAVE=12,AB_WAVE=13,AB_MINIVOLC=14,AB_VOLC=15,AB_WAVES=16,AB_BAIL=17,AB_BSTHUNT=18,AB_WKILL=19,AB_EKILL=20,AB_WEAK=21,AB_STOP=22,AB_SLOW=23,AB_ONLY=24,AB_GOOD=25,AB_RESIST=26,AB_RESISTS=27,AB_MASSIVE=28,AB_MASSIVES=29,AB_KB=30,AB_WARP=31,AB_IMUATK=32,AB_CURSE=33,AB_BURROW=34,AB_REVIVE=35,AB_POIATK=36,AB_GLASS=37,AB_SHIELD=38,AB_DSHIELD=39,AB_COUNTER=40,AB_AFTERMATH=41,RES_WEAK=0,RES_STOP=1,RES_SLOW=2,RES_KB=3,RES_WAVE=4,RES_SURGE=5,RES_CURSE=6,RES_TOXIC=7,RES_WARP=8,trait_no_treasure=TB_DEMON|TB_EVA|TB_WITCH|TB_WHITE|TB_RELIC,trait_treasure=TB_RED|TB_FLOAT|TB_BLACK|TB_ANGEL|TB_ALIEN|TB_ZOMBIE|TB_METAL,_l_unit=localStorage.getItem("unit");let _l_f=localStorage.getItem("prec");function t3str(x){var s=x.toString();switch(s.length){case 2:return"0"+s;case 1:return"00"+s}return s}function numStr(num){return _l_f.format(num)}function numStrT(num){return"F"==_l_unit?num.toString()+" F":numStr(num/30)+" 秒"}function combineChances(count,chance){let x=1;for(let i=0;i<count;++i)x*=(100-chance)/100;return 1-x}function getChances(freq,pres,chance,duration){var segments=[];outer:for(let now=0;;now-=freq)for(let i=pres.length-1;0<=i;--i){if(!(0<=now+pres[i]+duration))break outer;var a=now+pres[i],z=Math.min(a+duration,freq);a!=z&&segments.push([Math.max(a,0),z])}var steps=[];let substeps=[];for(let i=0;i<=freq;++i){for(var x of segments)i!=x[0]&&i!=x[1]||(i==x[0]?substeps.push(!0):substeps.push(!1));substeps.length&&(steps.push([i,substeps]),substeps=[])}let cover=0,last=steps[0][0],count=0;for(let x of steps){var s,now=x[0];const substeps=x[1];cover+=combineChances(count,chance)*(now-last)/freq;for(s of substeps)s?++count:--count;last=now}return 100*Math.min(cover,1)}function getCover(p,durationF,attackF){return p/=100,durationF=(durationF/=attackF)-(attackF=~~durationF),100*Math.min(1-durationF*Math.pow(1-p,1+attackF)-(1-durationF)*Math.pow(1-p,attackF),1)}function getCoverUnit(unit,chance,duration){if(!(unit.pre2+unit.pre1))return numStr(getCover(chance,duration,unit.attackF));var pres=[];for(let i=4;1<=i;i>>=1)if(unit.abi&i)switch(i){case 1:pres.push(unit.pre2);break;case 2:pres.push(unit.pre1);break;case 4:pres.push(unit.pre)}return numStr(getChances(unit.attackF,pres,chance,duration))}function get_trait_short_names(trait){var trait_short_names=["紅","浮","黑","鐵","天","星","死","古","無","使徒","魔女","惡"],s="";let i=0;for(let x=1;x<=TB_DEMON;x<<=1)trait&x&&(s+=trait_short_names[i]),i++;return s}function useCurve(i){my_curve=_curves[i]}function getLevelMulti(level){var c,multi=.8;let n=0;for(c of my_curve){if(level<=n)break;multi+=Math.min(level-n,10)*(c/100),n+=10}return multi}_l_f=_l_f?parseInt(_l_f):2,_l_f=new Intl.NumberFormat(void 0,{maximumFractionDigits:_l_f});class Form{constructor(name,jp_name,desc,cat_id,level_count,data){if(data){2==level_count&&(this.involve=enemy_descs[cat_id]),this.desc=desc,this.id=cat_id,this.lvc=level_count,this.name=name,this.jp_name=jp_name,this.trait=0,this.ab={},this.res={},this.imu=0,this.price=data[6],this.range=data[5],this.hp=data[0],this.kb=data[1],this.cd=2*data[7],this.atk=data[3],this.atk1=0|data[59],this.atk2=0|data[60],this.pre=data[13],this.pre1=data[61],this.pre2=data[62],this.tba=2*data[4],this.speed=data[2],this.abi=((null==data[63]?1:data[63])<<2)+((0|data[64])<<1)+(0|data[65]),this.backswing=anim1[cat_id][level_count],this.attackF=(this.pre2||this.pre1||this.pre)+Math.max(this.backswing,this.tba-1);var x,desc="fcsu"[level_count],jp_name=t3str(cat_id),cat_id=_eggs[level_count],atkCount=(0<=cat_id?(level_count=t3str(cat_id),this.icon=`/img/s/${level_count}/${level_count}_m.png`):this.icon=`/img/u/${jp_name}/${desc}/uni${jp_name}_${desc}00.png`,data[10]&&(this.trait|=TB_RED),data[16]&&(this.trait|=TB_FLOAT),data[17]&&(this.trait|=TB_BLACK),data[18]&&(this.trait|=TB_METAL),data[19]&&(this.trait|=TB_WHITE),data[20]&&(this.trait|=TB_ANGEL),data[21]&&(this.trait|=TB_ALIEN),data[22]&&(this.trait|=TB_ZOMBIE),data[78]&&(this.trait|=TB_RELIC),data[96]&&(this.trait|=TB_DEMON),this.trait&&(data[23]&&(this.ab[AB_GOOD]=null),data[24]&&(this.ab[AB_KB]=[data[24]]),data[25]&&(this.ab[AB_STOP]=[data[25],data[26]]),data[27]&&(this.ab[AB_SLOW]=[data[27],data[28]]),data[32]&&(this.ab[AB_ONLY]=null),data[37]&&(this.ab[AB_WEAK]=[data[37],data[39],data[38]]),data[29]&&(this.ab[AB_RESIST]=null),data[30]&&(this.ab[AB_MASSIVE]=null),data[80]&&(this.ab[AB_RESISTS]=null),data[81]&&(this.ab[AB_MASSIVES]=null),data[92])&&(this.ab[AB_CURSE]=[data[92],data[93]]),data[31]&&(this.ab[AB_CRIT]=data[31]),data[33]&&(this.ab[AB_BOUNTY]=null),data[34]&&(this.ab[AB_ATKBASE]=[300]),data[46]&&(this.imu|=IMU_WAVE),data[48]&&(this.imu|=IMU_KB),data[49]&&(this.imu|=IMU_STOP),data[50]&&(this.imu|=IMU_SLOW),data[51]&&(this.imu|=IMU_WEAK),data[75]&&(this.imu|=IMU_WARP),data[56]&&(this.imu|=IMU_BOSSWAVE),2==data[58]&&(this.ab[AB_GLASS]=null),data[79]&&(this.imu|=IMU_CURSE),data[90]&&(this.imu|=IMU_POIATK),data[91]&&(this.imu|=IMU_VOLC),data[41]&&(this.ab[AB_STRONG]=[data[40],data[41]]),data[42]&&(this.ab[AB_LETHAL]=data[42]),data[43]&&(this.ab[AB_METALIC]=null),data[47]&&(this.ab[AB_WAVES]=null),data[35]&&(data.length<95||1!=data[94]?this.ab[AB_WAVE]=[data[35],data[36]]:this.ab[AB_MINIWAVE]=[data[35],data[36]]),52<=data.length&&(data[52]&&(this.ab[AB_ZKILL]=null),data[53]&&(this.ab[AB_WKILL]=null),data[77]&&(this.ab[AB_EKILL]=null),data[70]&&(this.ab[AB_BREAK]=[data[70]]),data[84],data[85],data[82]&&(this.ab[AB_S]=[data[82],data[83]]),data[84]&&(this.ab[AB_IMUATK]=[data[84],data[85]]),data[86]&&(cat_id=data[87]>>2,level_count=data[87]+data[88]>>2,desc=20*(jp_name=data[89]),109<=data.length&&1==data[108]?this.ab[AB_MINIVOLC]=[data[86],cat_id,level_count,desc,jp_name]:this.ab[AB_VOLC]=[data[86],cat_id,level_count,desc,jp_name]),data[95]&&(this.ab[AB_SHIELDBREAK]=[data[95]]),data[97]&&(this.ab[AB_BAIL]=null),data[98]&&(this.ab[AB_CKILL]=null),data[105]&&(this.ab[AB_BSTHUNT]=[data[106],data[107]]),data[109])&&(this.ab[AB_COUNTER]=null),this.atkType=data[12]?ATK_RANGE:ATK_SINGLE,0==this.atk1?1:0==this.atk2?2:3);this.lds=new Array(atkCount),this.lds[0]=data[44],this.ldr=new Array(atkCount),this.ldr[0]=data[45];for(let i=1;i<atkCount;++i)1==data[99+3*(i-1)]?(this.lds[i]=data[99+3*(i-1)+1],this.ldr[i]=data[99+3*(i-1)+2]):(this.lds[i]=this.lds[0],this.ldr[i]=this.ldr[0]);for(x of this.ldr){if(x<0){this.atkType|=ATK_OMNI;break}if(0<x){this.atkType|=ATK_LD;break}}this.tba+this.pre<this.attackF/2&&(this.atkType|=ATK_KB_REVENGE)}else Object.assign(this,name)}applyTalent(talent,level){if(level){var t,x,y,z,maxLv=talent[1]-1,inc1=~~(talent[2]+--level*(talent[3]-talent[2])/maxLv),inc2=~~(talent[4]+level*(talent[5]-talent[4])/maxLv),inc3=~~(talent[6]+level*(talent[7]-talent[6])/maxLv),inc4=~~(talent[8]+level*(talent[9]-talent[8])/maxLv);switch(talent[0]){case 1:x=inc2+((t=this.ab[AB_WEAK])?t[2]:0),y=inc1+(t?t[0]:0),z=inc3+(t?t[1]:0),this.ab[AB_WEAK]=[y,z,x];break;case 2:x=inc2+((t=this.ab[AB_STOP])?t[1]:0),y=inc1+(t?t[0]:0),this.ab[AB_STOP]=[y,x];break;case 3:x=inc2+((t=this.ab[AB_SLOW])?t[1]:0),y=inc1+(t?t[0]:0),this.ab[AB_SLOW]=[y,x];break;case 4:this.ab[AB_ONLY]=null;break;case 5:this.ab[AB_GOOD]=null;break;case 6:this.ab[AB_RESIST]=null;break;case 7:this.ab[AB_MASSIVE]=null;break;case 8:x=inc1+((t=this.ab[AB_KB])?t[0]:0),this.ab[AB_KB]=[x];break;case 10:x=(t=this.ab[AB_STRONG])?t[0]:100-inc1,y=inc2+(t?t[1]:0),this.ab[AB_STRONG]=[x,y];break;case 11:x=inc1+((t=this.ab[AB_LETHAL])||0),this.ab[AB_LETHAL]=x;break;case 12:this.ab[AB_ATKBASE]=null;break;case 13:x=inc1+((t=this.ab[AB_CRIT])||0),this.ab[AB_CRIT]=x;break;case 14:this.ab[AB_ZKILL]=null;break;case 15:x=inc1+((t=this.ab[AB_BREAK])?t[0]:0),this.ab[AB_BREAK]=[x];break;case 16:this.ab[AB_BOUNTY]=null;break;case 17:x=inc1+((t=this.ab[AB_WAVE])?t[0]:0),y=inc2+(t?t[1]:0),this.ab[AB_WAVE]=[x,y];break;case 18:this.res[RES_WEAK]=inc1;break;case 19:this.res[RES_STOP]=inc1;break;case 20:this.res[RES_SLOW]=inc1;break;case 21:this.res[RES_KB]=inc1;break;case 22:this.res[RES_WAVE]=inc1;break;case 23:this.ab[AB_WAVES]=null;break;case 24:this.res[RES_WARP]=inc1;break;case 25:this.price-=inc1;break;case 26:this.cd-=inc1;break;case 27:this.speed+=inc1;break;case 29:this.imu|=IMU_CURSE;break;case 30:this.res[RES_CURSE]=inc1;break;case 31:this.atkM=1+inc1/100;break;case 32:this.hpM=1+inc1/100;break;case 33:this.trait|=TB_RED;break;case 34:this.trait|=TB_FLOAT;break;case 35:this.trait|=TB_BLACK;break;case 36:this.trait|=TB_METAL;break;case 37:this.trait|=TB_ANGEL;break;case 38:this.trait|=TB_ALIEN;break;case 39:this.trait|=TB_ZOMBIE;break;case 40:this.trait|=TB_RELIC;break;case 41:this.trait|=TB_WHITE;break;case 42:this.trait|=TB_WITCH;break;case 43:this.trait|=TB_EVA;break;case 44:this.imu|=IMU_WEAK;break;case 45:this.imu|=IMU_STOP;break;case 46:this.imu|=IMU_SLOW;break;case 47:this.imu|=IMU_KB;break;case 48:this.imu|=IMU_WAVE;break;case 49:this.imu|=IMU_WARP;break;case 50:x=inc1+((t=this.ab[AB_S])?t[0]:0),y=inc2+(t?t[1]:0),this.ab[AB_S]=[x,y];break;case 51:x=inc1+((t=this.ab[AB_IMUATK])?t[0]:0),y=inc2+(t?t[1]:0),this.ab[AB_IMUATK]=[x,y];break;case 52:this.res[RES_TOXIC]=inc1;break;case 53:this.imu|=IMU_POIATK;break;case 54:this.res[RES_SURGE]=inc1;break;case 55:this.imu|=IMU_VOLC;break;case 56:x=inc1+((t=this.ab[AB_VOLC])?t[0]:0),y=inc2+(t?t[4]:0),z=inc3>>2,this.ab[AB_VOLC]=[x,z,z+(inc4>>2),20*y,y];break;case 57:this.trait|=TB_DEMON;break;case 58:x=inc1+((t=this.ab[AB_SHIELDBREAK])?t[0]:0),this.ab[AB_SHIELDBREAK]=[x];break;case 59:this.ab[AB_CKILL]=null;break;case 60:x=inc2+((t=this.ab[AB_CURSE])?t[1]:0),y=inc1+(t?t[0]:0),this.ab[AB_CURSE]=[y,x];break;case 61:this.tba=~~(this.tba*(100-inc1)/100),this.attackF=(this.pre2||this.pre1||this.pre)+Math.max(this.backswing,this.tba-1);break;case 62:x=inc1+((t=this.ab[AB_MINIWAVE])?t[0]:0),y=inc2+(t?t[1]:0),this.ab[AB_MINIWAVE]=[x,y];break;case 63:this.ab[AB_BAIL]=null;break;case 64:this.ab[AB_BSTHUNT]=[inc1,inc2];break;case 65:x=inc1+((t=this.ab[AB_MINIVOLC])?t[0]:0),y=inc2+(t?t[4]:0),z=inc3>>2,this.ab[AB_MINIVOLC]=[x,z,z+(inc4>>2),20*y,y]}}}applySuperTalents(talents,levels){let j=0;for(let i=0;i<112&&talents[i];i+=14)1==talents[i+13]&&this.applyTalent(talents.subarray(i,i+14),levels[j++])}applyTalents(info,levels){info.hasOwnProperty("talentT")&&(this.trait|=info.talentT);let _super=!(this.res={}),j=0;for(let i=0;i<112&&info.talents[i];i+=14)1==info.talents[i+13]?_super=!0:this.applyTalent(info.talents.subarray(i,i+14),levels[j++]);return _super}hasres(r){return this.res&&this.res.hasOwnProperty(r)}hasab(ab){return this.ab.hasOwnProperty(ab)}getid(){return this.id}gettba(){return this.tba}getpre(){return this.pre}getpre1(){return this.pre1}getpre2(){return this.pre2}getTotalLv(){return Math.min(def_lv,_info.maxBase)+Math.min(plus_lv,_info.maxPlus)}getmax_base_lv(){return _info.maxBase}getmax_plus_lv(){return _info.maxPlus}getslow_time(){var t=this.ab[AB_SLOW];return t?t[1]:0}getslow_prob(){var t=this.ab[AB_SLOW];return t?t[0]:0}getstop_time(){var t=this.ab[AB_STOP];return t?t[1]:0}getstop_prob(){var t=this.ab[AB_STOP];return t?t[0]:0}getcurse_time(){var t=this.ab[AB_CURSE];return t?t[1]:0}getcurse_prob(){var t=this.ab[AB_CURSE];return t?t[0]:0}getweak_time(){var t=this.ab[AB_WEAK];return t?t[2]:0}getweak_prob(){var t=this.ab[AB_WEAK];return t?t[0]:0}getweak_extent(){var t=this.ab[AB_WEAK];return t?t[1]:0}getstrong_extent(){var t=this.ab[AB_STRONG];return t?t[1]:0}getlethal_prob(){return this.ab[AB_LETHAL]||0}getsavage_extent(){var t=this.ab[AB_S];return t?t[1]:0}getsavage_prob(){var t=this.ab[AB_S];return t?t[0]:0}getbreak_prob(){var t=this.ab[AB_BREAK];return t?t[0]:0}getshield_break_prob(){var t=this.ab[AB_SHIELDBREAK];return t?t[0]:0}getmini_wave_prob(){var t=this.ab[AB_MINIWAVE];return t?t[0]:0}getwave_prob(){var t=this.ab[AB_WAVE];return t?t[0]:0}getmini_surge_prob(){var t=this.ab[AB_MINIVOLC];return t?t[0]:0}getsurge_prob(){var t=this.ab[AB_VOLC];return t?t[0]:0}getdodge_time(){var t=this.ab[AB_IMUATK];return t?t[1]:0}getdodge_prob(){var t=this.ab[AB_IMUATK];return t?t[0]:0}getformc(){return this.lvc+1}getkb(){return this.kb}getrarity(){return _info.rarity}gettrait(){return this.trait}getrange(){return this.range}getattackf(){return this.attackF}getattacks(){return this.attackF/30}getrevenge(){return 0!=(this.atkType&ATK_KB_REVENGE)}getbackswing(){return this.backswing}getbeast_prob(){var t=this.ab[AB_BSTHUNT];return t?t[0]:0}getbeast_time(){var t=this.ab[AB_BSTHUNT];return t?t[1]:0}getstop_cover(){var t=this.ab[AB_STOP];return t?getCoverUnit(this,t[0],this.trait&trait_treasure?~~(1.2*t[1]):t[1]):0}getslow_cover(){var t=this.ab[AB_SLOW];return t?getCoverUnit(this,t[0],this.trait&trait_treasure?~~(1.2*t[1]):t[1]):0}getweak_cover(){var t=this.ab[AB_WEAK];return t?getCoverUnit(this,t[0],this.trait&trait_treasure?~~(1.2*t[2]):t[2]):0}getcurse_cover(){var t=this.ab[AB_CURSE];return t?getCoverUnit(this,t[0],this.trait&trait_treasure?~~(1.2*t[1]):t[1]):0}gethp(){return~~(~~(2.5*Math.round(this.hp*getLevelMulti(this.getTotalLv())))*this.hpM)}getatk(){var m=getLevelMulti(this.getTotalLv());let atk=~~(~~(2.5*Math.round(this.atk*m))*this.atkM);return this.atk1&&(atk+=~~(~~(2.5*Math.round(this.atk1*m))*this.atkM),this.atk2)&&(atk+=~~(~~(2.5*Math.round(this.atk2*m))*this.atkM)),atk}getattack(){return this.getatk()}getdps(){return~~(30*this.getatk()/this.attackF)}getthp(){let hp=this.gethp();return this.ab.hasOwnProperty(AB_WKILL)?10*hp:this.ab.hasOwnProperty(AB_EKILL)?5*hp:(this.ab.hasOwnProperty(AB_RESIST)?hp*=this.trait&trait_treasure?5:4:this.ab.hasOwnProperty(AB_RESISTS)&&(hp*=this.trait&trait_treasure?7:6),this.ab.hasOwnProperty(AB_GOOD)&&(hp*=this.trait&trait_treasure?2:2.5),this.ab.hasOwnProperty(AB_BSTHUNT)?hp/=.6:this.ab.hasOwnProperty(AB_BAIL)&&(hp/=.7),hp)}getwavelv(){var t=this.ab[AB_WAVE];return t?t[1]:0}getvolclv(){var t=this.ab[AB_VOLC];return t?t[4]:0}getminiwavelv(){var t=this.ab[AB_MINIWAVE];return t?t[1]:0}getminivolclv(){var t=this.ab[AB_MINIVOLC];return t?t[4]:0}getcrit(){return 0|this.ab[AB_CRIT]}hpagainst(traits){let hp=this.gethp();var t;return traits&TB_WITCH&&this.ab.hasOwnProperty(AB_WKILL)?10*hp:traits&TB_EVA&&this.ab.hasOwnProperty(AB_EKILL)?5*hp:((t=this.trait&traits)&&(this.ab.hasOwnProperty(AB_RESIST)?hp*=t&trait_treasure?5:4:this.ab.hasOwnProperty(AB_RESISTS)&&(hp*=t&trait_treasure?7:6),this.ab.hasOwnProperty(AB_GOOD))&&(hp*=t&trait_treasure?2:2.5),traits&TB_BEAST&&(hp/=.6),traits&TB_BARON&&(hp/=.7),hp)}dpsagainst(traits){if(this.ab.hasOwnProperty(AB_ONLY)&&!(traits&this.trait))return 0;let t=0;for(var x of this._dpsagainst(traits))t+=~~x;return~~(30*t/this.attackF)}_dpsagainst(traits){let atks=this._getatks(),v;var t;return this.ab.hasOwnProperty(AB_ATKBASE)?(this.mul(atks,1+this.ab[AB_ATKBASE][0]/100),atks):(this.ab.hasOwnProperty(AB_VOLC)?(v=this.ab[AB_VOLC],this.mul(atks,1+v[4]*v[0]/100,!1)):this.ab.hasOwnProperty(AB_MINIVOLC)&&(v=this.ab[AB_MINIVOLC],this.mul(atks,1+v[4]*v[0]/500,!1)),this.ab.hasOwnProperty(AB_WAVE)?this.mul(atks,1+this.ab[AB_WAVE][0]/100,!1):this.ab.hasOwnProperty(AB_MINIWAVE)&&this.mul(atks,1+this.ab[AB_MINIWAVE][0]/500,!1),this.ab.hasOwnProperty(AB_S)&&(v=this.ab[AB_S],this.mul(atks,1+v[0]*v[1]/1e4,!1)),this.ab.hasOwnProperty(AB_CRIT)&&(traits&TB_METAL?this.mul(atks,this.ab[AB_CRIT]/100,!1):this.mul(atks,1+this.ab[AB_CRIT]/100,!1)),this.ab.hasOwnProperty(AB_STRONG)&&this.mul(atks,1+this.ab[AB_STRONG][1]/100),traits&TB_EVA&&this.ab.hasOwnProperty(AB_EKILL)||traits&TB_WITCH&&this.ab.hasOwnProperty(AB_WKILL)?(this.mul(atks,5),atks):((t=this.trait&traits)&&(t=t&trait_treasure,this.ab.hasOwnProperty(AB_MASSIVE)?this.mul(atks,t?4:3):this.ab.hasOwnProperty(AB_MASSIVES)&&this.mul(atks,t?6:5),this.ab.hasOwnProperty(AB_GOOD))&&this.mul(atks,t?1.8:1.5),traits&TB_BEAST&&this.ab.hasOwnProperty(AB_BSTHUNT)&&this.mul(atks,2.5),traits&TB_BARON&&this.ab.hasOwnProperty(AB_BAIL)&&this.mul(atks,1.6),traits&TB_METAL?null==(t=this.ab[AB_CRIT])?atks=[1]:(atks[0]+=1-t/100,atks):atks))}_gettatk(){var atks=this._getatks();return this.ab.hasOwnProperty(AB_ATKBASE)?this.mul(atks,1+this.ab[AB_ATKBASE][0]/100):(this.ab.hasOwnProperty(AB_VOLC)?this.mul(atks,1+this.ab[AB_VOLC][4],!1):this.ab.hasOwnProperty(AB_MINIVOLC)&&this.mul(atks,1+.2*this.ab[AB_MINIVOLC][4],!1),this.ab.hasOwnProperty(AB_WAVE)?this.mul(atks,2,!1):this.ab.hasOwnProperty(AB_MINIWAVE)&&this.mul(atks,1.2,!1),this.ab.hasOwnProperty(AB_S)&&this.mul(atks,1+this.ab[AB_S][1]/100,!1),this.ab.hasOwnProperty(AB_CRIT)&&this.mul(atks,2,!1),this.ab.hasOwnProperty(AB_STRONG)&&this.mul(atks,1+this.ab[AB_STRONG][1]/100),this.ab.hasOwnProperty(AB_EKILL)||this.ab.hasOwnProperty(AB_WKILL)?this.mul(atks,5):(this.ab.hasOwnProperty(AB_MASSIVE)?this.mul(atks,this.trait&trait_treasure?4:3):this.ab.hasOwnProperty(AB_MASSIVES)&&this.mul(atks,this.trait&trait_treasure?6:5),this.ab.hasOwnProperty(AB_GOOD)&&this.mul(atks,this.trait&trait_treasure?1.8:1.5),this.ab.hasOwnProperty(AB_BSTHUNT)?this.mul(atks,2.5):this.ab.hasOwnProperty(AB_BAIL)&&this.mul(atks,1.6))),atks}getrange_min(){return this.atkType&ATK_OMNI||this.atkType&ATK_LD?Math.max.apply(null,this.lds):this.range}getrange_max(){if(this.atkType&ATK_OMNI||this.atkType&ATK_LD){m=this.lds[0]+this.ldr[1];for(let i=1;i<this.lds.length;++i)m=Math.max(m,this.lds[i]+this.ldr[i]);return m}return this.range}getreach_base(){return this.lds.length&&0<this.lds[0]?this.lds[0]:this.range}getrange_interval(){return this.lds.length?Math.abs(this.ldr[0]):0}getrange_interval_max(){if(this.atkType&ATK_OMNI||this.atkType&ATK_LD){let x,r=this.lds[0],R=r+this.ldr[0];for(let i=1;i<this.lds.length;++i)x=this.lds[i],r=Math.max(r,x),R=Math.max(R,x+this.ldr[i]);return Math.abs(R-r)}return 0}involve4_require(x){if(_info.f4Reqs)for(const r of _info.f4Reqs)if(r[1]==x)return r[0];return 0}involve_require(x){if(_info.upReqs)for(const r of _info.upReqs)if(r[1]==x)return r[0];return 0}getatkcount(){let c=1;return this.pre1&&(c+=1,this.pre2)&&(c+=1),c}gettdps(){let t=0;for(var x of this._gettdps())t+=~~x;return~~(30*t/this.attackF)}_gettdps(){var atks=this._getatks();let v;return this.ab.hasOwnProperty(AB_ATKBASE)?this.mul(atks,1+this.ab[AB_ATKBASE][0]/100):(this.ab.hasOwnProperty(AB_VOLC)?(v=this.ab[AB_VOLC],this.mul(atks,1+v[4]*v[0]/100,!1)):this.ab.hasOwnProperty(AB_MINIVOLC)&&(v=this.ab[AB_MINIVOLC],this.mul(atks,1+v[4]*v[0]/500,!1)),this.ab.hasOwnProperty(AB_WAVE)?this.mul(atks,1+this.ab[AB_WAVE][0]/100,!1):this.ab.hasOwnProperty(AB_MINIWAVE)&&this.mul(atks,1+this.ab[AB_MINIWAVE][0]/500,!1),this.ab.hasOwnProperty(AB_S)&&(v=this.ab[AB_S],this.mul(atks,1+v[0]*v[1]/1e4,!1)),this.ab.hasOwnProperty(AB_CRIT)&&this.mul(atks,1+this.ab[AB_CRIT]/100,!1),this.ab.hasOwnProperty(AB_STRONG)&&this.mul(atks,1+this.ab[AB_STRONG][1]/100),this.ab.hasOwnProperty(AB_EKILL)||this.ab.hasOwnProperty(AB_WKILL)?this.mul(atks,5):(this.ab.hasOwnProperty(AB_MASSIVE)?this.mul(atks,this.trait&trait_treasure?4:3):this.ab.hasOwnProperty(AB_MASSIVES)&&this.mul(atks,this.trait&trait_treasure?6:5),this.ab.hasOwnProperty(AB_GOOD)&&this.mul(atks,this.trait&trait_treasure?1.8:1.5),this.ab.hasOwnProperty(AB_BSTHUNT)?this.mul(atks,2.5):this.ab.hasOwnProperty(AB_BAIL)&&this.mul(atks,1.6))),atks}_getatks(){var m=getLevelMulti(this.getTotalLv()),atks=[this.atk];this.atk1&&atks.push(this.atk1),this.atk2&&atks.push(this.atk2);for(let i=0;i<atks.length;++i)atks[i]=~~(~~(Math.round(atks[i]*m)*atk_t)*this.atkM);return atks}gettatk(){let s=0;for(const i of this._gettatk())s+=i;return s}mul(arr,s,ab=!0){for(let i=0;i<arr.length;++i)(ab||this.abi&1<<2-i)&&(arr[i]*=s)}_gettatk(){var atks=this._getatks();return this.ab.hasOwnProperty(AB_ATKBASE)?this.mul(atks,1+this.ab[AB_ATKBASE][0]/100):(this.ab.hasOwnProperty(AB_VOLC)?this.mul(atks,1+this.ab[AB_VOLC][4],!1):this.ab.hasOwnProperty(AB_MINIVOLC)&&this.mul(atks,1+.2*this.ab[AB_MINIVOLC][4],!1),this.ab.hasOwnProperty(AB_WAVE)?this.mul(atks,2,!1):this.ab.hasOwnProperty(AB_MINIWAVE)&&this.mul(atks,1.2,!1),this.ab.hasOwnProperty(AB_S)&&this.mul(atks,1+this.ab[AB_S][1]/100,!1),this.ab.hasOwnProperty(AB_CRIT)&&this.mul(atks,2,!1),this.ab.hasOwnProperty(AB_STRONG)&&this.mul(atks,1+this.ab[AB_STRONG][1]/100),this.ab.hasOwnProperty(AB_EKILL)||this.ab.hasOwnProperty(AB_WKILL)?this.mul(atks,5):(this.ab.hasOwnProperty(AB_MASSIVE)?this.mul(atks,this.trait&trait_treasure?4:3):this.ab.hasOwnProperty(AB_MASSIVES)&&this.mul(atks,this.trait&trait_treasure?6:5),this.ab.hasOwnProperty(AB_GOOD)&&this.mul(atks,this.trait&trait_treasure?1.8:1.5),this.ab.hasOwnProperty(AB_BSTHUNT)?this.mul(atks,2.5):this.ab.hasOwnProperty(AB_BAIL)&&this.mul(atks,1.6))),atks}getspeed(){return this.speed}getprice(){return 1.5*this.price}getcost(){return 1.5*this.price}getcdf(){return getRes(this.cd)}getcd(){return getRes(this.cd)/30}getimu(){return this.imu}getatktype(){return this.atkType}}class CatInfo{constructor(id,t4){id instanceof Object?Object.assign(this,id):(this.loadTalents(id),this.loadAttitional(id)),t4&&(this.t4=t4)}getRarityString(cat_id){return["基本","EX","稀有","激稀有","超激稀有","傳說稀有"][this.rarity]}loadAttitional(my_id){this.fandom=fandom[my_id];for(var end,obt_id=obtainid[my_id],text=(null!=obt_id&&(this.obtain=obt_id),unit_buy),i=0,start=0;i<my_id;){for(var j=start;"\n"!=text[j];++j);start=j+1,++i}for(end=start;"\n"!=text[end];++end);var amount,data=text.slice(start,end).split(",").map(x=>parseInt(x));if(data[0]&&(this.unclockS=data[0]),data[1]&&(this.unclockFood=data[1]),rwMap.hasOwnProperty(my_id.toString())&&(this.rw=rwMap[my_id]),tfMap.hasOwnProperty(my_id.toString())&&(this.tf=tfMap[my_id]),this.rarity=data[13],this.maxBase=data[50],this.maxPlus=data[51],1e5<=(obt_id=data[data.length-6])&&(this.version=obt_id),data[23]&&(this.tfmethod=data[23]),data[27]){this.upReqs=[[data[27],0]];for(let i=28;i<38;i+=2)(amount=data[i+1])&&this.upReqs.push([amount,data[i]])}if(data[38]){this.f4Reqs=[[data[38],0]];for(let i=39;i<49;i+=2)(amount=data[i+1])&&this.f4Reqs.push([amount,data[i]])}this.crazed=5e4<data[3]&&3==data[13],this.xp_data=data.slice(2,12).join(","),_eggs=data.slice(data.length-2),(obt_id=unit_orbs[my_id])&&(this.orbC=obt_id)}loadTalents(my_id){if(-1!=(my_id=skill_file.indexOf(`
${my_id},`))){++my_id;let end;for(end=my_id;"\n"!=skill_file[end]&&skill_file[end];++end);var data=skill_file.slice(my_id,end).split(",");this.talents=new Int16Array(112),"0"!=data[1]&&(this.talentT=parseInt(data[1]));for(let i=0;i<112;++i)this.talents[i]=data[2+i]}}}class Enemy{constructor(id,name,jp_name,data,trait){if(id instanceof Object)Object.assign(this,id);else{this.id=id,id-=2,this.ts=trait,this.name=name,this.jp_name=jp_name,this.fandom=fandom[id],this.desc=enemy_descs[id],this.backswing=anim1[id],this.hp=data[0],this.kb=data[1],this.speed=data[2],this.atk=data[3],this.tba=2*data[4],this.atkType=data[11]?ATK_RANGE:ATK_SINGLE,this.earn=data[6],this.range=data[5],this.trait=0,this.isrange=0!=data[11],this.pre=data[12],this.death=data[54],this.atk1=data[55],this.atk2=data[56],this.pre1=data[57],this.pre2=data[58],this.abi=((null==data[59]?1:data[59])<<2)+(data[60]<<1)+data[61],this.star=data[69],this.ab={},this.imu=0,this.attackF=(this.pre2||this.pre1||this.pre)+Math.max(this.backswing,this.tba-1),data[10]&&(this.trait|=TB_RED),data[13]&&(this.trait|=TB_FLOAT),data[14]&&(this.trait|=TB_BLACK),data[15]&&(this.trait|=TB_METAL),data[16]&&(this.trait|=TB_WHITE),data[17]&&(this.trait|=TB_ANGEL),data[18]&&(this.trait|=TB_ALIEN),data[19]&&(this.trait|=TB_ZOMBIE),data[48]&&(this.trait|=TB_WITCH),data[49]&&(this.trait|=TB_INFN),data[71]&&(this.trait|=TB_EVA),data[72]&&(this.trait|=TB_RELIC),data[93]&&(this.trait|=TB_DEMON),data[94]&&(this.trait|=TB_BARON),data[101]&&(this.trait|=TB_BEAST),data[20]&&(this.ab[AB_KB]=[data[20]]),data[29]&&(this.ab[AB_WEAK]=[data[29],data[30],data[31]]),data[21]&&(this.ab[AB_STOP]=[data[21],data[22]]),data[23]&&(this.ab[AB_SLOW]=[data[23],data[24]]),data[73]&&(this.ab[AB_CURSE]=[data[73],data[74]]),data[25]&&(this.ab[AB_CRIT]=data[25]),data[26]&&(this.ab[AB_ATKBASE]=null),data[32]&&(this.ab[AB_STRONG]=[data[32],data[33]]),data[34]&&(this.ab[AB_LETHAL]=data[34]),data[38]&&(this.ab[AB_WAVES]=null),data[43]&&(this.ab[AB_BURROW]=[data[43],data[44]>>2]),data[45]&&(this.ab[AB_REVIVE]=[data[45],data[46],data[47]]),2==data[52]&&(this.ab[AB_GLASS]=null),data[64]&&(this.ab[AB_SHIELD]=[data[64]]),data[65]&&(this.ab[AB_WARP]=[data[65],data[66],data[67]>>2]),data[75]&&(this.ab[AB_S]=[data[75],data[76]]),data[77]&&(this.ab[AB_IMUATK]=[data[77],data[78]]),data[79]&&(this.ab[AB_POIATK]=[data[79],data[80]]),data[87]&&(this.ab[AB_DSHIELD]=[data[87],data[88]]),data[89]&&(this.ab[AB_AFTERMATH]=[data[89],data[90]>>2,data[91]+data[90]>>2,data[92]]),data[103]&&(this.ab[AB_COUNTER]=null),data[27]&&(data[86]?this.ab[AB_MINIWAVE]=[data[27],data[28]]:this.ab[AB_WAVE]=[data[27],data[28]]),data[81]&&(data[102]?this.ab[AB_MINIVOLC]=[data[81],data[82]>>2,data[83]+data[82]>>2,data[84]]:this.ab[AB_VOLC]=[data[81],data[82]>>2,data[83]+data[82]>>2,data[84]]),data[37]&&(this.imu|=IMU_WAVE),data[39]&&(this.imu|=IMU_KB),data[40]&&(this.imu|=IMU_STOP),data[41]&&(this.imu|=IMU_SLOW),data[42]&&(this.imu|=IMU_WEAK),data[85]&&(this.imu|=IMU_VOLC),data[70]&&(this.imu|=IMU_WARP);var x,atkCount=0==this.atk1?1:0==this.atk2?2:3;this.lds=new Array(atkCount),this.lds[0]=data[35],this.ldr=new Array(atkCount),this.ldr[0]=data[36];for(let i=1;i<atkCount;++i)1==data[95+3*(i-1)]?(this.lds[i]=data[95+3*(i-1)+1],this.ldr[i]=data[95+3*(i-1)+2]):(this.lds[i]=this.lds[0],this.ldr[i]=this.ldr[0]);for(x of this.ldr){if(x<0){this.atkType|=ATK_OMNI;break}if(0<x){this.atkType|=ATK_LD;break}}this.tba+this.pre<this.attackF/2&&(this.atkType|=ATK_KB_REVENGE)}}gethp(){return this.hp}getthp(){return this.hp}getatk(){return this.atk+this.atk1+this.atk2}getattack(){return this.getatk()}gettatk(){return this.getatk()}getdps(){return 30*this.getatk()/this.attackF}gettdps(){return this.getdps()}getimu(){return this.imu}hasab(i){return this.ab.hasOwnProperty(i)}getid(){return this.id-2}hasres(){return 0}gettba(){return this.tba}getpre(){return this.pre}getpre1(){return this.pre1}getpre2(){return this.pre2}getTotalLv(){return 0}getkb(){return this.kb}gettrait(){return this.trait}getrange(){return this.range}getattackf(){return this.attackF}getattacks(){return this.attackF/30}getrevenge(){return 0!=(this.atkType&ATK_KB_REVENGE)}getbackswing(){return this.backswing}getcost(){return Math.round(100*(this.earn*(.95+.05*treasures[18]+.005*treasures[3])+Number.EPSILON))/100}getprice(){return this.getCost()}getspeed(){return this.speed}getatktype(){return this.atkType}}class Cat{constructor(id,unit_file,curve,name,jp_name,desc,ic,t4){if(id instanceof Object){this.forms=new Array(id.forms.length);for(let i=0;i<id.forms.length;++i)this.forms[i]=new Form(id.forms[i]);this.info=new CatInfo(id.info),this.curve=id.curve,this.ic=id.ic}else{this.curve=curve,this.info=new CatInfo(id,t4),this.forms=new Array(unit_file.length),this.ic=ic;for(let i=0;i<unit_file.length;++i)this.forms[i]=new Form(name[i]||"",jp_name[i]||"",desc[i],id,i,unit_file[i].split(",").map(x=>parseInt(x)))}}init(){for(var f of this.forms)f.hpM=1,f.atkM=1}getObj(){return{info:this.info,forms:this.forms,curve:this.curve,ic:this.ic}}}async function getJSON(url){url=await fetch(url);if(url.ok)return url.json();throw"load failed"}async function getText(url){url=await fetch(url);if(url.ok)return url.text();throw"load failed"}async function getAllEnemies(){var enemy_data=await getJSON("/data/enemies.json"),t_unit=(fandom=await getJSON("/data/fandomEnemyNames.json"),(await getText("/data/t_unit.csv")).replace("\r","").split("\n").filter(x=>x.trim()).map(line=>line.split(",").map(x=>parseInt(x)))),en_tw=(enemy_descs=enemy_data["tw-desc"],anim1=enemy_data.backswing,enemy_data["tw-name"]),en_jp=enemy_data["jp-name"],traits=enemy_data.trait,enemies=new Array(t_unit.length);for(let id=2;id<enemies.length;++id){var unit_file=t_unit[id],y=id-2;enemies[id]=new Enemy(id,en_tw[y],en_jp[y],unit_file,traits[y])}return anim1=fandom=enemy_descs=enim1=null,enemies}async function getAllCats(){var loader_text=document.getElementById("loader-text"),all_cats=(loader_text.textContent="載入中(1/5)",(await getText("/data/all_cats")).split("\n")),cat_data=(loader_text.textContent="載入中(2/5)",await getJSON("/data/cat.json")),t4=(loader_text.textContent="載入中(3/5)",fandom=await getJSON("/data/fandomCatNames.json"),loader_text.textContent="載入中(4/5)",unit_buy=await getText("/data/unitbuy.csv"),loader_text.textContent="載入中(5/5)",skill_file=await getText("/data/SkillAcquisition.csv"),loader_text.textContent="即將完成",rwMap=cat_data.rwMap,tfMap=cat_data.tfMap,cat_data.t4),levels=cat_data.curve,tw_n=cat_data["tw-name"],jp_n=cat_data["jp-name"],dec=cat_data["tw-desc"],ic=cat_data.ic,cats=(enemy_descs=cat_data.involve,anim1=cat_data.backswing,unit_orbs=cat_data.orb,obtainid=cat_data.obtain,new Array(anim1.length));for(let id=0;id<cats.length;++id)cats[id]=new Cat(id,all_cats[id].split("\t"),levels[id],tw_n[id],jp_n[id],dec[id],ic[id],t4[id]);return enemy_descs=anim1=fandom=obtainid=skill_file=rwMap=tfMap=unit_buy=null,cats}function onupgradeneeded(event){event=event.target.result;try{event.deleteObjectStore("cats")}catch(e){}try{event.deleteObjectStore("enemy")}catch(e){}let store=event.createObjectStore("cats",{keyPath:"id"});store.createIndex("data","",{unique:!1}),(store=event.createObjectStore("enemy",{keyPath:"id"})).createIndex("data","",{unique:!1})}async function loadCat(id){return new Promise(resolve=>{var req=indexedDB.open("db",BC_VER);req.onupgradeneeded=onupgradeneeded,req.onsuccess=function(event){const db=event.target.result;db.transaction(["cats"],"readwrite").objectStore("cats").get(id).onsuccess=function(event){if(event=event.target.result)return(event=new Cat(event.data)).init(),resolve(event);getAllCats().then(cats=>{var tx=db.transaction(["cats"],"readwrite"),store=tx.objectStore("cats");for(let i=0;i<cats.length;++i)store.put({id:i,data:cats[i].getObj()});tx.oncomplete=function(){var c=cats[id];c.init(),db.close(),resolve(c)}})}}})}async function loadEnemy(id){return new Promise((resolve,reject)=>{var req=indexedDB.open("db",BC_VER);req.onupgradeneeded=onupgradeneeded,req.onsuccess=function(event){const db=event.target.result;db.transaction(["enemy"],"readwrite").objectStore("enemy").get(id).onsuccess=function(event){if(event=event.target.result)return event.data?resolve(new Enemy(event.data)):reject();getAllEnemies().then(es=>{var tx=db.transaction(["enemy"],"readwrite"),store=tx.objectStore("enemy");for(let i=0;i<es.length;++i)store.put({id:i,data:es[i]});tx.oncomplete=function(){db.close(),resolve(es[id])}})}}})}async function loadAllEnemies(){return new Promise(resolve=>{var req=indexedDB.open("db",BC_VER);req.onupgradeneeded=onupgradeneeded,req.onsuccess=function(event){const db=event.target.result;db.transaction(["enemy"],"readwrite").objectStore("enemy").get(651).onsuccess=function(event){if(event.target.result){let es=new Array(675);db.transaction(["enemy"],"readwrite").objectStore("enemy").openCursor().onsuccess=function(event){(event=event.target.result)?(event.value.data&&(es[event.value.id]=new Enemy(event.value.data)),event.continue()):(resolve(es),db.close())}}else getAllEnemies().then(es=>{var tx=db.transaction(["enemy"],"readwrite"),store=tx.objectStore("enemy");for(let i=0;i<es.length;++i)store.put({id:i,data:es[i]});tx.oncomplete=function(){resolve(es),db.close()}})}}})}async function loadAllCats(){return new Promise(resolve=>{var req=indexedDB.open("db",BC_VER);req.onupgradeneeded=onupgradeneeded,req.onsuccess=function(event){const db=event.target.result;db.transaction(["cats"],"readwrite").objectStore("cats").get(717).onsuccess=function(event){if(event.target.result){let cats=new Array(727);db.transaction(["cats"],"readwrite").objectStore("cats").openCursor().onsuccess=function(event){var c;(event=event.target.result)?((c=new Cat(event.value.data)).init(),cats[event.value.id]=c,event.continue()):(resolve(cats),db.close())}}else getAllCats().then(cats=>{var c,tx=db.transaction(["cats"],"readwrite"),store=tx.objectStore("cats");for(let i=0;i<cats.length;++i)store.put({id:i,data:cats[i].getObj()});for(c of cats)c.init();tx.oncomplete=function(){resolve(cats),db.close()}})}}})}function createImuIcons(imu,parent){var names=["波動傷害","使動作停止","使動作變慢","打飛敵人","烈波傷害","攻擊力下降","傳送","古代的詛咒","毒擊傷害","魔王震波"],icon_names=["MacWKW6","OSjMN62","rPx4aA2","5CYatS4","Uadt9Fa","aN6I67V","T7BXYAw","27mAxhl","5zleNqO","4uYsoCg"];if(imu){let i=0,c=0;for(let x=1;x<=512;x<<=1,++i)if(imu&x){if(2==++c){const p=document.createElement("div");parent.removeChild(parent.lastElementChild);var texts=[];for(x=1,i=0;x<=512;x<<=1,++i)imu&x&&((e=new Image(40,40)).src="https://i.imgur.com/"+icon_names[i]+".png",p.appendChild(e),texts.push(names[i]));return p.append("無效（"+texts.join("、")+"）"),void parent.appendChild(p)}var e,p=document.createElement("div");(e=new Image(40,40)).src="https://i.imgur.com/"+icon_names[i]+".png",p.appendChild(e),p.append(names[i]+"無效"),parent.appendChild(p)}}}function getAbiString(abi){var strs;return abi?(strs=[],4&abi&&strs.push("一"),2&abi&&strs.push("二"),1&abi&&strs.push("三"),"，第"+strs.join(" / ")+"擊附加特性"):""}const treasures=[300,300,300,300,300,300,300,300,300,300,300,30,10,30,30,30,30,30,30,30,100,600,1500,300,100,30,300,300,300,300,100];for(let i=0;i<31;++i){const x=localStorage.getItem("t$"+i.toString());null!=x&&(treasures[i]=parseInt(x))}const atk_t=300==treasures[0]?2.5:1+.005*treasures[0],hp_t=300==treasures[1]?2.5:1+.005*treasures[1];function getRes(cd){return Math.max(60,cd-6*(treasures[17]-1)-.3*treasures[2])}