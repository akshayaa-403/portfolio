/* Phase-Contrast Clean-Up: "One slide, four lies". A lab notebook that
   follows one held-out frame, img_0002, from the first screen to the last.
   Every number here is in `sources`; the stage images were written by
   tools/phase-stages.py, which runs the project's own code. */
(function () {
  'use strict';

  var IMG = 'public/assets/projects/phase-0002-';
  var STAGES = ['raw', 'dog', 'clahe', 'residual', 'hybrid', 'truth'];
  var STAGE_LABEL = { raw: 'Captured', dog: 'DoG', clahe: 'CLAHE', residual: 'Residual', hybrid: 'Output', truth: 'Truth' };
  var STAGE_ALT = {
    raw: 'img_0002 as captured: twenty grey cells under a bright-to-dark ramp, with dark moats round each cell',
    dog: 'img_0002 after the difference of Gaussians: edges sharpened, the ramp still there',
    clahe: 'img_0002 after CLAHE: the ramp flattened but the background turned to coarse grain',
    residual: 'The U-Net residual for img_0002: light on the background and at cell edges, mid-grey inside the cells',
    hybrid: 'img_0002 after the U-Net: dark background, cells bright and close to the truth',
    truth: 'The ground truth for img_0002: twenty soft ellipses on black'
  };

  /* img_0002 as the seeded generator drew it (replay of data/generate_synthetic.py,
     seed 42, 256 px): [cx, cy, ax, ay, angle, intensity] in draw order. */
  var CELLS = [[51,168,21,23,137.02,0.517],[15,137,24,15,41.95,0.628],[141,190,8,8,29.88,0.914],[155,160,16,19,105.7,0.905],[110,152,14,22,147.42,0.818],[153,227,10,23,22.84,0.874],[55,202,11,18,10.54,0.749],[60,151,18,8,91.87,0.869],[44,48,18,12,153.98,0.699],[42,90,23,20,115.21,0.751],[221,212,22,15,99.17,0.682],[151,235,21,9,108.13,0.795],[221,76,20,10,116.46,0.693],[169,85,13,10,117.74,0.933],[76,93,12,19,92.47,0.771],[166,26,12,14,12.13,0.61],[228,201,22,21,22.73,0.645],[182,161,8,20,129.85,0.754],[91,29,18,15,163.33,0.616],[199,211,23,16,166.21,0.752]];
  var GEN = { hs: 4.862, hl: 9.724, s: 1.908, gx: 0.868, gy: 0.569, amp: 0.856, noise: 0.0116 };

  /* Per-frame held-out metrics, 20 frames (scratchpad evalval.py, repo code, fp16 weights). */
  var VAL_IDS = [2, 4, 18, 21, 24, 25, 27, 33, 42, 50, 51, 52, 56, 59, 61, 71, 81, 92, 97, 99];
  var VAL = {
    psnr: {
      raw: [12.249,10.641,10.689,11.127,10.676,9.308,12.223,13.175,14.243,11.832,12.715,12.843,10.888,11.021,11.291,10.975,9.010,11.699,9.740,12.805],
      cv: [8.404,8.050,7.376,8.155,7.566,7.483,6.819,6.890,7.729,7.397,8.027,6.869,6.656,7.131,6.710,7.408,7.125,7.375,7.443,7.290],
      hy: [19.244,18.261,18.608,19.028,20.530,20.048,22.721,22.810,21.108,20.494,17.349,22.220,20.850,21.482,23.335,20.369,15.214,21.572,18.544,21.471]
    },
    dice: {
      raw: [0.894,0.727,0.963,0.824,0.789,0.944,0.961,0.984,0.976,0.896,0.977,0.990,0.965,0.556,0.952,0.916,0.863,0.840,0.898,0.967],
      cv: [0.664,0.636,0.484,0.614,0.525,0.515,0.371,0.380,0.530,0.472,0.602,0.387,0.292,0.497,0.330,0.450,0.451,0.471,0.498,0.425],
      hy: [0.905,0.867,0.896,0.898,0.921,0.922,0.943,0.944,0.943,0.922,0.856,0.968,0.888,0.901,0.939,0.916,0.808,0.923,0.862,0.924]
    }
  };

  /* Two real 32x32 CLAHE tiles of img_0002's DoG output (8x8 grid on 256 px),
     quantised the shipped way (uint16) and the usual way (uint8). Written by
     tools/phase-stages.py. */
  var TILES = {
    background: { ty: 7, tx: 3,
      u16: [24933,23936,24625,24373,24429,24721,24961,24931,25619,24639,25562,25207,25577,24953,25517,25088,25709,25404,25431,25445,25735,25683,24992,25605,24944,25600,25953,25049,25457,25602,25216,24894,24335,23976,24946,25006,24092,24381,24648,24975,24651,25607,24920,25548,25255,24617,26127,26023,26016,25693,26677,25413,25415,25380,25346,25940,25915,25261,25294,25076,25201,25042,24955,25263,24383,24372,24365,24079,24431,25347,25297,24347,24693,25009,25002,25280,25586,24934,25499,25761,25124,25451,25434,25435,25402,26336,25328,25615,25272,25608,26299,25438,25606,25482,25058,26032,23762,24437,24412,24748,24445,24401,24982,25307,25339,25372,24752,25366,25950,25590,25539,25502,25508,25499,25478,25769,26041,25354,25984,25618,25948,25363,25434,25201,25043,24626,25547,24936,24403,23782,24713,24702,24752,24433,25363,25351,24721,25402,25112,24781,25045,25298,25552,25845,25848,26148,25787,25420,25678,25322,25320,25608,25944,25085,24862,25585,26071,25034,25347,24455,24024,24676,24625,24961,24712,25098,24781,24455,25418,24745,25400,25397,25356,25605,25513,25826,24896,25530,26121,25733,26294,26906,25951,25904,25872,25328,25785,25258,25481,25119,25737,25177,24648,24941,25219,24916,25016,24446,25124,25117,25069,25675,25668,25324,25942,25224,26428,26094,25840,25521,25469,25771,25727,26008,24677,25560,26795,26229,25718,25909,25554,24235,25824,25916,24687,24341,24946,25284,25039,25086,25087,25080,25360,25655,25011,25639,25940,25558,26098,25755,26133,25794,26714,25451,25500,25448,26662,26251,26228,24998,26097,25632,25269,25596,25621,24434,24092,24736,24725,25070,24458,25099,25722,25055,25341,25672,25377,26003,25330,24934,26435,25432,25806,25123,26662,26054,25484,25778,25710,25365,25377,26087,25555,25730,25639,25305,25046,25506,24731,25049,24438,24795,24806,25094,24717,25014,25965,25368,25110,25724,25656,25893,26430,26409,26463,25792,26683,26040,26073,26035,26015,26029,25708,25774,25285,25157,25697,26001,25067,26175,25009,25317,24375,25389,25067,25016,26257,25240,25569,25674,25121,25397,25946,25889,25847,26158,25202,25841,26107,25754,25705,26266,25914,25292,26619,26059,26246,25494,25742,24738,25745,25885,24662,24979,25957,25019,25362,25625,25215,25803,26128,25597,25383,25997,26234,25909,25607,25902,26510,25827,25795,26089,26342,26533,26784,26184,26282,25756,25585,25810,25434,26396,25129,26278,24992,24351,24998,25053,24759,25663,25557,25798,26414,25515,25955,25289,26204,25904,25952,25911,26141,26414,26401,26399,25383,25920,26784,26171,25657,25446,26208,25805,25817,25150,26164,25027,24984,25321,25674,25416,25111,24692,25895,25181,25449,26776,25233,26219,26495,25852,25875,25507,26397,26042,26384,25739,27029,25657,26539,26221,26651,25730,26801,25802,24902,25891,25905,26057,24984,25342,25081,24789,25057,26253,25862,25847,26460,25797,26182,25879,26161,26103,26721,26361,27298,26013,26373,26049,26049,26022,26280,26270,25025,26370,26473,25799,25880,24942,25632,25471,25326,25044,24798,25439,25981,25565,25875,25563,25540,26150,25832,25883,25859,26748,26693,26350,25997,26671,26029,26986,26020,26337,25958,26579,26623,26070,26231,26160,25841,25883,26280,26140,24664,25984,24747,25075,25649,25582,25580,25938,25934,26205,27147,25879,26218,26163,26110,25743,27014,26373,26044,26978,25990,26617,26239,26225,26626,26138,25683,25567,26155,25531,25634,25809,25282,25598,25627,25655,25331,26272,26269,25660,26013,25358,26301,26269,26244,25866,26452,27062,26385,26065,26398,26362,26648,26264,26854,26553,26015,25834,25668,26207,25811,26489,25311,26464,25614,25283,25597,26254,25013,25698,25704,25721,26060,26107,25135,26364,26275,26847,26769,25771,26425,27394,26412,26040,26298,25918,26855,26244,26345,26089,27170,25454,25762,26130,25630,26158,25372,25695,24987,25916,25964,25068,26076,25402,26363,25753,26101,25709,26279,25557,26785,27092,26138,26143,26102,26980,27215,26874,26562,26614,26360,26385,26779,26693,26383,26457,25966,25859,24806,25136,26039,25965,26290,26343,25376,26318,26292,25981,26311,26596,26861,26500,26479,26470,26797,26132,26741,26341,26928,26264,26286,26320,25714,26068,26163,26080,25769,25509,25967,25533,25101,25167,25481,25451,25741,25366,26290,26264,26258,26571,26574,26241,26500,26777,26483,26186,26800,27059,26714,26725,26037,26966,26292,26948,26645,27007,26497,26101,26083,26104,25874,26762,25969,25442,25508,25201,25473,25997,26557,25914,25606,26577,26253,25924,26186,27437,26486,26849,25831,27050,26712,26101,26727,26651,26611,26619,25986,26660,26138,26051,26337,26315,26394,26011,25568,25364,25755,25786,25748,26261,26175,26195,26876,25931,26586,26878,26848,26180,26496,26476,26759,26687,26672,26709,26372,26637,26611,26644,26324,26628,26397,26957,25631,26263,26989,26286,26201,25277,25957,26002,25361,26561,26808,25840,26852,26269,26282,26554,26531,26519,26784,27033,26647,26927,27241,26609,26622,26929,26931,26337,26327,27254,26698,26612,26266,26274,26044,25966,25577,26211,26198,26260,25980,25596,26512,26174,26523,25936,26278,26536,26488,26460,26712,26949,27222,27199,26525,27171,27205,26237,26882,25959,25979,26945,26078,25982,26260,26285,26080,26624,25619,25241,26506,25250,25933,26555,25881,26853,26512,26860,26221,27135,27065,27040,26978,26908,26877,26532,27136,27105,26496,26503,27434,27147,27223,26298,27051,26272,26548,26263,25749,26282,25584,25861,26134,26158,26169,26162,26523,25584,26539,26831,26507,26148,27390,26064,27318,27252,27222,27195,27123,27397,27093,26776,27401,26453,26210,26297,26695,26534,26170,26557,26379,26247,25515,26130,26413,26093,26416,26435,26826,26242,26574,26185,27121,26135,27090,26755,26711,26314,26935,26584,26840,27102,27078,26755,26436,26767,27466,26263,26664,26811,26458,26208,25718,26227,26126,25803,26446,25782,26720,26090,25833,26546,25934,26851,27072,26726,26752,26762,26688,27560,26877,26563,27518,26492,27072,27034,27061,26743,27099,26224,26631,26789,26116,26832,26026,26224,26422,25165,26168,25500,26738,26744,26469,27169,26249,25861,26687,26954,26689,26395,26939,27116,27393,27127,26850,26822,27048,27647,26702,26387,27083,26537,26953,27137,25805,26821,26011,25888,26080,26139,26501,25842,26431,25779,26147,26185,26235,27142,27292,27542,27291,26683,27547,27058,27975,27077,26837,27139,27038,26990,26365,27996,26745,26214,26644,25859,26476,26498,26008,26204],
      u8: [97,93,95,94,95,96,97,97,99,95,99,98,99,97,99,97,100,98,98,99,100,99,97,99,97,99,100,97,99,99,98,96,94,93,97,97,93,94,95,97,95,99,96,99,98,95,101,101,101,99,103,98,98,98,98,100,100,98,98,97,98,97,97,98,94,94,94,93,95,98,98,94,96,97,97,98,99,97,99,100,97,99,98,98,98,102,98,99,98,99,102,98,99,99,97,101,92,95,94,96,95,94,97,98,98,98,96,98,100,99,99,99,99,99,99,100,101,98,101,99,100,98,98,98,97,95,99,97,94,92,96,96,96,95,98,98,96,98,97,96,97,98,99,100,100,101,100,98,99,98,98,99,100,97,96,99,101,97,98,95,93,96,95,97,96,97,96,95,98,96,98,98,98,99,99,100,96,99,101,100,102,104,100,100,100,98,100,98,99,97,100,97,95,97,98,96,97,95,97,97,97,99,99,98,100,98,102,101,100,99,99,100,100,101,96,99,104,102,100,100,99,94,100,100,96,94,97,98,97,97,97,97,98,99,97,99,100,99,101,100,101,100,103,99,99,99,103,102,102,97,101,99,98,99,99,95,93,96,96,97,95,97,100,97,98,99,98,101,98,97,102,98,100,97,103,101,99,100,100,98,98,101,99,100,99,98,97,99,96,97,95,96,96,97,96,97,101,98,97,100,99,100,102,102,102,100,103,101,101,101,101,101,100,100,98,97,99,101,97,101,97,98,94,98,97,97,102,98,99,99,97,98,100,100,100,101,98,100,101,100,100,102,100,98,103,101,102,99,100,96,100,100,95,97,101,97,98,99,98,100,101,99,98,101,102,100,99,100,103,100,100,101,102,103,104,101,102,100,99,100,98,102,97,102,97,94,97,97,96,99,99,100,102,99,100,98,101,100,100,100,101,102,102,102,98,100,104,101,99,99,101,100,100,97,101,97,97,98,99,98,97,96,100,97,99,104,98,102,103,100,100,99,102,101,102,100,105,99,103,102,103,100,104,100,96,100,100,101,97,98,97,96,97,102,100,100,102,100,101,100,101,101,103,102,106,101,102,101,101,101,102,102,97,102,103,100,100,97,99,99,98,97,96,98,101,99,100,99,99,101,100,100,100,104,103,102,101,103,101,105,101,102,101,103,103,101,102,101,100,100,102,101,95,101,96,97,99,99,99,100,100,101,105,100,102,101,101,100,105,102,101,104,101,103,102,102,103,101,99,99,101,99,99,100,98,99,99,99,98,102,102,99,101,98,102,102,102,100,102,105,102,101,102,102,103,102,104,103,101,100,99,101,100,103,98,102,99,98,99,102,97,99,100,100,101,101,97,102,102,104,104,100,102,106,102,101,102,100,104,102,102,101,105,99,100,101,99,101,98,99,97,100,101,97,101,98,102,100,101,100,102,99,104,105,101,101,101,104,105,104,103,103,102,102,104,103,102,102,101,100,96,97,101,101,102,102,98,102,102,101,102,103,104,103,103,102,104,101,104,102,104,102,102,102,100,101,101,101,100,99,101,99,97,97,99,99,100,98,102,102,102,103,103,102,103,104,103,101,104,105,103,103,101,104,102,104,103,105,103,101,101,101,100,104,101,98,99,98,99,101,103,100,99,103,102,100,101,106,103,104,100,105,103,101,103,103,103,103,101,103,101,101,102,102,102,101,99,98,100,100,100,102,101,101,104,100,103,104,104,101,103,103,104,103,103,103,102,103,103,103,102,103,102,104,99,102,105,102,101,98,101,101,98,103,104,100,104,102,102,103,103,103,104,105,103,104,105,103,103,104,104,102,102,106,103,103,102,102,101,101,99,101,101,102,101,99,103,101,103,100,102,103,103,102,103,104,105,105,103,105,105,102,104,101,101,104,101,101,102,102,101,103,99,98,103,98,100,103,100,104,103,104,102,105,105,105,104,104,104,103,105,105,103,103,106,105,105,102,105,102,103,102,100,102,99,100,101,101,101,101,103,99,103,104,103,101,106,101,106,106,105,105,105,106,105,104,106,102,101,102,103,103,101,103,102,102,99,101,102,101,102,102,104,102,103,101,105,101,105,104,103,102,104,103,104,105,105,104,102,104,106,102,103,104,102,101,100,102,101,100,102,100,103,101,100,103,100,104,105,103,104,104,103,107,104,103,107,103,105,105,105,104,105,102,103,104,101,104,101,102,102,97,101,99,104,104,102,105,102,100,103,104,103,102,104,105,106,105,104,104,105,107,103,102,105,103,104,105,100,104,101,100,101,101,103,100,102,100,101,101,102,105,106,107,106,103,107,105,108,105,104,105,105,105,102,108,104,102,103,100,103,103,101,101] },
    cell: { ty: 5, tx: 1,
      u16: [30204,30866,32303,32101,32712,32730,32804,32891,33649,33833,34072,34272,34701,34751,35069,36568,37010,37290,37826,40076,41766,44149,47377,48817,48377,49735,50186,50375,50606,50548,50246,49073,30072,30596,31473,31920,32837,32866,33299,33461,33645,33832,34370,33626,34442,34858,35196,35721,36811,37473,38129,39530,41310,44671,46514,47505,48875,49482,49586,50086,50300,49903,49214,49321,30230,30238,31207,32021,32305,32974,33414,33632,33237,33465,34318,34225,34418,34869,35241,35799,36586,36948,37662,38867,40807,43275,45396,46567,47778,49262,49320,49813,49708,49310,49903,49042,29751,31108,31489,32704,32060,33720,33511,33421,34366,33989,34538,34444,34987,35135,34871,35792,36956,36681,38074,39095,40264,41865,45236,46925,48016,48104,49078,48902,49466,49095,48421,48613,29678,31742,31188,32442,32480,33184,33628,34199,34185,33504,34417,34682,34274,35079,35785,36084,35667,36728,38170,38354,39380,41759,44514,45488,47095,48020,48896,48684,48939,48290,48690,48362,29362,29866,31277,31875,32575,32990,34109,33703,33349,34937,34261,34575,34507,34675,34752,35729,36636,36119,37337,38297,38499,41078,43003,44604,46061,47467,47565,48597,48184,47918,47829,46714,28999,30857,31626,32236,32954,33082,33260,34161,34444,34733,34407,34408,34985,35168,35619,35024,36295,36464,36780,37189,38541,39765,40942,43900,45275,46510,47429,47076,47625,48083,46881,45965,29598,30509,31298,31917,32649,33443,33982,33943,34261,33920,35203,34200,35118,34668,35461,35561,35267,36117,37120,37618,38183,39376,40515,42378,43159,45572,46645,47181,46744,46628,45241,44772,29623,30209,31636,32551,32621,33100,34009,33705,34390,34398,34352,35281,34576,35112,34586,35988,35081,35998,36102,37027,37450,37942,39384,40561,41224,44005,45011,45147,45669,45910,44554,43407,29708,29936,31344,32222,33242,34051,34019,34079,34462,34163,34772,34706,34630,35136,35580,35693,36113,36439,36297,36655,37565,37643,38044,39851,39864,41593,43020,43799,43327,43224,41784,41433,29855,29993,31380,32259,32618,33432,34054,33765,34472,34206,35186,35137,35679,35171,35952,35444,35555,35579,36114,37177,37236,36834,38755,39212,38916,40000,40989,41502,41981,41457,40802,39847,29141,30431,31439,31989,33324,33485,33765,34408,35092,34211,34620,33968,34498,35291,35425,35229,35985,36038,36292,37079,36541,37219,37017,38002,37624,39000,39248,39891,40364,40007,39406,39445,28859,30321,30917,32077,32398,33520,33794,34091,34430,35173,34602,34618,35523,35072,35237,35998,35777,35876,35531,36026,37114,36501,37353,38107,38202,37498,38918,38727,38257,38750,39226,38372,28662,29667,31132,31878,32789,33873,33155,34427,34764,33849,35187,35531,34880,35482,35033,35483,35934,35392,36361,36224,36671,37048,37609,38082,37900,38256,38786,38348,38894,38694,38740,38425,28313,29489,30496,31797,32624,33298,33824,34099,34444,35173,35200,34897,34932,35223,35109,35581,35392,35505,35835,36375,36190,36288,36588,37088,37561,37276,38498,38755,38347,38124,38115,38095,27618,28529,30304,30504,31902,33108,33189,33763,34796,33601,34271,35237,34600,35229,35469,35973,36113,36220,35920,35826,37278,37082,36456,37963,37140,37868,37853,37833,37089,37787,38384,37700,25923,28436,29535,31159,31167,32619,34225,34112,34508,33930,35200,34821,35487,35532,35526,35089,35549,35643,36324,36577,36406,36532,36907,37462,37303,37745,37784,37418,37602,37635,37949,37305,24439,26969,29633,30965,31485,32245,33153,33967,33318,34595,34829,35422,35774,34901,35258,35451,36233,36042,36449,36399,36856,37599,36677,37255,37755,37583,37317,38532,38013,38091,38172,36602,22429,25437,28424,29098,31005,31006,32195,32941,33516,34061,34616,34914,35591,35664,34981,36426,36236,36096,35895,35522,36943,37023,37410,37670,37846,37695,37454,37377,37839,37626,37095,36832,20730,24040,26780,28733,30322,31107,32210,33234,32451,33945,34512,33877,34884,34553,35738,35839,36298,36460,36530,37430,37252,37387,37486,37446,38603,37778,38498,37453,37955,37789,37279,37371,19208,22016,25281,27917,29523,30723,31380,31992,32767,33254,34121,34104,34435,34716,35207,35958,36424,36563,37228,37433,37910,38040,37498,37835,38036,37836,37852,38735,37977,37902,37453,37294,18161,19957,23955,26461,28129,30024,30478,31584,32235,32670,33476,34347,34945,35200,35690,36447,36260,36077,36749,37593,37356,38355,38698,38044,38268,39035,38050,38621,38919,37643,36940,37178,17270,18819,21819,24073,26513,28727,29217,30753,31552,31872,32933,33416,33967,34511,34978,35706,36755,37153,36510,37350,38025,38244,39109,39332,39184,38303,39610,38953,38395,37884,37930,37318,15578,17573,19735,21595,24621,27202,28991,29251,30765,31879,32520,33587,33737,34542,35277,35951,35938,37527,38087,38205,38137,39866,39286,39354,40390,40124,40166,39950,40204,38243,38493,37460,15922,16059,17778,18753,21978,25164,26700,28575,30405,30933,31725,32301,33601,33970,34936,35842,37052,36906,37639,38570,39323,39909,40783,41674,41965,41682,42121,41383,40489,39392,37980,37943,15708,15841,16402,18196,19240,21390,24249,26255,28434,30233,30668,31929,33666,33882,35361,36122,36845,37506,39029,39413,39956,41693,42437,42931,43220,43625,43133,42443,41612,40668,39262,37768,15086,15416,15979,15911,18420,20390,21273,23349,25393,27529,30163,31724,32868,33167,34736,35572,36981,38341,38666,40471,42460,42479,43869,44402,45083,43904,44385,43963,43744,41922,41177,38936,14414,14887,14980,16176,16501,17349,18654,20972,23114,25214,27996,29628,31438,33342,34858,35908,37508,39124,40161,40857,43138,44159,45311,45309,45400,45196,45312,44506,44552,43425,40631,38146,13671,14240,14436,15158,16768,17031,17750,19112,21567,22616,25199,27095,29626,30501,32518,35232,37507,39276,41636,42922,43363,44845,45136,44905,45680,45427,45512,45048,45080,43897,42077,39389,14170,13808,14747,14975,15822,15992,16668,18389,19598,20673,22869,23896,26962,29769,30907,34251,37842,40781,41928,44165,44076,45379,46075,46860,46025,46739,47170,45793,44861,44204,42491,39959,13369,14022,13722,14391,14390,15647,16149,16835,18363,19390,21185,23059,24838,27029,30533,34561,37672,40988,43036,44330,45632,46052,46470,47274,46794,47548,46723,46017,45364,44550,43537,41985,13251,13257,13623,14330,14717,15373,16262,17418,17836,19384,21372,21742,23833,26105,30138,35039,39215,42158,43638,45040,45422,45879,47646,47502,47364,47509,47367,46628,46231,45281,44031,41830],
      u8: [117,120,125,124,127,127,127,127,130,131,132,133,135,135,136,142,144,145,147,155,162,171,184,189,188,193,195,196,196,196,195,190,117,119,122,124,127,127,129,130,130,131,133,130,134,135,136,138,143,145,148,153,160,173,180,184,190,192,192,194,195,194,191,191,117,117,121,124,125,128,130,130,129,130,133,133,133,135,137,139,142,143,146,151,158,168,176,181,185,191,191,193,193,191,194,190,115,121,122,127,124,131,130,130,133,132,134,134,136,136,135,139,143,142,148,152,156,162,176,182,186,187,190,190,192,191,188,189,115,123,121,126,126,129,130,133,133,130,133,134,133,136,139,140,138,142,148,149,153,162,173,176,183,186,190,189,190,187,189,188,114,116,121,124,126,128,132,131,129,135,133,134,134,134,135,139,142,140,145,149,149,159,167,173,179,184,185,189,187,186,186,181,112,120,123,125,128,128,129,132,134,135,133,133,136,136,138,136,141,141,143,144,149,154,159,170,176,180,184,183,185,187,182,178,115,118,121,124,127,130,132,132,133,131,136,133,136,134,137,138,137,140,144,146,148,153,157,164,167,177,181,183,181,181,176,174,115,117,123,126,126,128,132,131,133,133,133,137,134,136,134,140,136,140,140,144,145,147,153,157,160,171,175,175,177,178,173,168,115,116,121,125,129,132,132,132,134,132,135,135,134,136,138,138,140,141,141,142,146,146,148,155,155,161,167,170,168,168,162,161,116,116,122,125,126,130,132,131,134,133,136,136,138,136,139,137,138,138,140,144,144,143,150,152,151,155,159,161,163,161,158,155,113,118,122,124,129,130,131,133,136,133,134,132,134,137,137,137,140,140,141,144,142,144,144,147,146,151,152,155,157,155,153,153,112,117,120,124,126,130,131,132,133,136,134,134,138,136,137,140,139,139,138,140,144,142,145,148,148,145,151,150,148,150,152,149,111,115,121,124,127,131,129,133,135,131,136,138,135,138,136,138,139,137,141,140,142,144,146,148,147,148,150,149,151,150,150,149,110,114,118,123,126,129,131,132,134,136,136,135,135,137,136,138,137,138,139,141,140,141,142,144,146,145,149,150,149,148,148,148,107,111,117,118,124,128,129,131,135,130,133,137,134,137,138,139,140,140,139,139,145,144,141,147,144,147,147,147,144,147,149,146,100,110,114,121,121,126,133,132,134,132,136,135,138,138,138,136,138,138,141,142,141,142,143,145,145,146,147,145,146,146,147,145,95,104,115,120,122,125,129,132,129,134,135,137,139,135,137,137,140,140,141,141,143,146,142,144,146,146,145,149,147,148,148,142,87,98,110,113,120,120,125,128,130,132,134,135,138,138,136,141,140,140,139,138,143,144,145,146,147,146,145,145,147,146,144,143,80,93,104,111,117,121,125,129,126,132,134,131,135,134,139,139,141,141,142,145,144,145,145,145,150,146,149,145,147,147,145,145,74,85,98,108,114,119,122,124,127,129,132,132,133,135,136,139,141,142,144,145,147,148,145,147,148,147,147,150,147,147,145,145,70,77,93,102,109,116,118,122,125,127,130,133,135,136,138,141,141,140,142,146,145,149,150,148,148,151,148,150,151,146,143,144,67,73,84,93,103,111,113,119,122,124,128,130,132,134,136,138,143,144,142,145,147,148,152,153,152,149,154,151,149,147,147,145,60,68,76,84,95,105,112,113,119,124,126,130,131,134,137,139,139,146,148,148,148,155,152,153,157,156,156,155,156,148,149,145,61,62,69,72,85,97,103,111,118,120,123,125,130,132,135,139,144,143,146,150,153,155,158,162,163,162,163,161,157,153,147,147,61,61,63,70,74,83,94,102,110,117,119,124,130,131,137,140,143,145,151,153,155,162,165,167,168,169,167,165,161,158,152,146,58,59,62,61,71,79,82,90,98,107,117,123,127,129,135,138,143,149,150,157,165,165,170,172,175,170,172,171,170,163,160,151,56,57,58,62,64,67,72,81,89,98,108,115,122,129,135,139,145,152,156,158,167,171,176,176,176,175,176,173,173,168,158,148,53,55,56,58,65,66,69,74,83,88,98,105,115,118,126,137,145,152,162,167,168,174,175,174,177,176,177,175,175,170,163,153,55,53,57,58,61,62,64,71,76,80,88,92,104,115,120,133,147,158,163,171,171,176,179,182,179,181,183,178,174,172,165,155,52,54,53,55,55,60,62,65,71,75,82,89,96,105,118,134,146,159,167,172,177,179,180,183,182,185,181,179,176,173,169,163,51,51,53,55,57,59,63,67,69,75,83,84,92,101,117,136,152,164,169,175,176,178,185,184,184,184,184,181,179,176,171,162] }
  };

  /* ---------- helpers ---------- */
  function refl(i, n) { while (i < 0 || i >= n) { if (i < 0) i = -i; if (i >= n) i = 2 * (n - 1) - i; } return i; }
  // OpenCV's GaussianBlur on float: ksize = round(8σ + 1) | 1, BORDER_REFLECT_101.
  function blur(src, w, h, s) {
    var n = (Math.round(s * 8 + 1) | 1), r = (n - 1) / 2, k = new Float64Array(n), sum = 0, i, x, y, a;
    for (i = 0; i < n; i++) { k[i] = Math.exp(-0.5 * (i - r) * (i - r) / (s * s)); sum += k[i]; }
    for (i = 0; i < n; i++) k[i] /= sum;
    var t = new Float32Array(w * h), o = new Float32Array(w * h);
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      a = 0; for (i = 0; i < n; i++) a += src[y * w + refl(x + i - r, w)] * k[i]; t[y * w + x] = a;
    }
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      a = 0; for (i = 0; i < n; i++) a += t[refl(y + i - r, h) * w + x] * k[i]; o[y * w + x] = a;
    }
    return o;
  }
  function otsu(u8) {
    var hist = new Array(256).fill(0), i, total = u8.length, sum = 0;
    for (i = 0; i < total; i++) hist[u8[i]]++;
    for (i = 0; i < 256; i++) sum += i * hist[i];
    var sB = 0, wB = 0, best = -1, t = 0;
    for (i = 0; i < 256; i++) {
      wB += hist[i]; if (!wB) continue;
      var wF = total - wB; if (!wF) break;
      sB += i * hist[i];
      var mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) * (mB - mF);
      if (v > best) { best = v; t = i; }
    }
    return t;
  }
  function toU8(f) {
    var lo = Infinity, hi = -Infinity, i, o = new Uint8Array(f.length);
    for (i = 0; i < f.length; i++) { if (f[i] < lo) lo = f[i]; if (f[i] > hi) hi = f[i]; }
    for (i = 0; i < f.length; i++) o[i] = Math.floor((f[i] - lo) / (hi - lo || 1) * 255);
    return o;
  }
  var pixCache = {};
  function pixels(stage, cb) {
    if (pixCache[stage]) { cb(pixCache[stage]); return; }
    var im = new Image();
    im.onload = function () {
      var c = document.createElement('canvas'); c.width = 256; c.height = 256;
      var x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(im, 0, 0);
      var d = x.getImageData(0, 0, 256, 256).data, g = new Uint8Array(65536);
      for (var i = 0; i < 65536; i++) g[i] = d[i * 4];
      pixCache[stage] = g; cb(g);
    };
    im.src = IMG + stage + '.webp';
  }
  function paintGray(ctx, u8, x, y, size, n) {
    n = n || 256;
    var c = document.createElement('canvas'); c.width = n; c.height = n;
    var cx = c.getContext('2d'), id = cx.createImageData(n, n);
    for (var i = 0; i < n * n; i++) { var v = u8[i]; id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; }
    cx.putImageData(id, 0, 0);
    ctx.imageSmoothingEnabled = n > 64;
    ctx.drawImage(c, x, y, size, size);
  }
  /* An SVG redrawn at its real pixel width, so text never shrinks on a phone. */
  function sized(host, draw) {
    var last = 0;
    function go() { var w = Math.round(host.getBoundingClientRect().width); if (w && w !== last) { last = w; draw(w); } }
    if (window.ResizeObserver) new ResizeObserver(go).observe(host);
    return function () { last = 0; go(); };
  }
  function setSeries(host, col) {
    var a = host.closest('.a');
    if (!a) return;
    a.style.setProperty('--ph-s0', col.series[0]);
    a.style.setProperty('--ph-s1', col.series[1]);
    a.style.setProperty('--ph-s2', col.series[2]);
  }
  function f2(n, d) { return Number(n).toFixed(d == null ? 2 : d).replace(/^-/, '−'); }

  /* OpenCV's CLAHE for one tile, on its own (no blending with neighbours). */
  function tileLut(px, bins, clip) {
    var area = px.length, hist = new Int32Array(bins), i;
    for (i = 0; i < area; i++) hist[px[i]]++;
    var ceil = Math.max(Math.floor(clip * area / bins), 1), clipped = 0;
    for (i = 0; i < bins; i++) if (hist[i] > ceil) { clipped += hist[i] - ceil; hist[i] = ceil; }
    var batch = Math.floor(clipped / bins), rest = clipped - batch * bins;
    if (batch) for (i = 0; i < bins; i++) hist[i] += batch;
    if (rest) { var step = Math.max(Math.floor(bins / rest), 1); for (i = 0; i < bins && rest > 0; i += step) { hist[i]++; rest--; } }
    var lut = new Float32Array(bins), s = 0, sc = (bins - 1) / area;
    for (i = 0; i < bins; i++) { s += hist[i]; lut[i] = Math.min(bins - 1, Math.round(s * sc)); }
    return { lut: lut, ceil: ceil, clipped: clipped };
  }

  Article.register('phase-contrast-denoising', {
    form: 'specimen',
    scramble: '░▒▓·∘○◌◍●',
    rail: 'loupe',
    dek: 'This is one frame, `img_0002`, followed from the moment I corrupted it to the moment a network gave most of it back. I know all 20 of its cells, because I drew them, and the network never trained on it. On the way it shows four lies: three I told on purpose, and one I told by accident.',

    opener: function (c) {
      return '<circle cx="64" cy="64" r="52" fill="none" stroke="' + c.l + '" stroke-width="1.2"/>' +
        '<ellipse cx="44" cy="50" rx="12" ry="8" transform="rotate(30 44 50)" fill="none" stroke="' + c.i + '" stroke-width="1.2"/>' +
        '<ellipse cx="78" cy="40" rx="7" ry="10" fill="none" stroke="' + c.i + '" stroke-width="1.2"/>' +
        '<ellipse cx="54" cy="86" rx="9" ry="13" transform="rotate(-20 54 86)" fill="none" stroke="' + c.i + '" stroke-width="1.2"/>' +
        '<circle cx="84" cy="78" r="20" fill="none" stroke="' + c.a + '" stroke-width="2"/>' +
        '<ellipse cx="84" cy="78" rx="11" ry="14" fill="none" stroke="' + c.a + '" stroke-width="1.2"/>' +
        '<line x1="98" y1="92" x2="114" y2="108" stroke="' + c.a + '" stroke-width="3" stroke-linecap="round"/>';
    },

    chapters: [
      { id: 'lie', label: 'Plate 1', title: 'I made the microscope lie on purpose',
        art: function (c) {
          return [0, 1, 2, 3].map(function (k) {
            return '<rect x="' + (30 + k * 14) + '" y="' + (20 + k * 14) + '" width="80" height="60" rx="4" fill="none" stroke="' + (k === 3 ? c.a : c.l) + '" stroke-width="1.3"/>';
          }).join('') + '<ellipse cx="100" cy="80" rx="12" ry="8" fill="none" stroke="' + c.i + '" stroke-width="1.3"/>';
        },
        blocks: [
          { p: 'Phase contrast is how you look at a living cell without staining it. The microscope turns tiny delays in the light passing through the cell into differences in brightness. It works, and it adds things that are not in the sample: a halo at every edge, uneven light across the field, and sensor noise.' },
          { p: 'The trouble comes later. Segmentation usually starts with a threshold: brighter than this is cell, darker is background. The halo and the uneven light both push pixels across that line, and every count and area measured afterwards inherits the error.' },
          { p: 'I had no real micrographs with hand-drawn masks, so I built the problem instead. `data/generate_synthetic.py` draws 8 to 21 soft ellipses as the truth, then adds three corruptions, each with a known size. It is seeded, so every one of the 100 committed frames can be replayed exactly.^[Replaying seed 42 at 256 px reproduces the committed PNGs bit for bit; checked on img_0000 to img_0005 (scratchpad replay.py, 2026-10-16).] That is how this page knows the true outline of every cell on the slide.',
            notes: [['seeded', 'seed 42. the same hundred frames, every time']] },
          { scrolly: 'microscope', caption: 'img_0002 rebuilt in your browser from the generator’s recorded parameters. Two stand-ins: cells are filled by a point-in-ellipse test rather than OpenCV’s polygon, and the noise is the same σ but not numpy’s draw. The scan is row 168; the dashed line is a global Otsu threshold. Live Otsu Dice on this rebuild: {{gdice|—}}. With all three corruptions on it reads 0.893; the repo’s own saved frame scores 0.894.',
            steps: [
              { p: 'Start with the truth: 20 ellipses, brightness 0.5 to 1.0, softened by a σ 1.5 blur. A global Otsu threshold finds them almost exactly. The tinted area on the frame is what the threshold calls cell.', state: { halo: false, ramp: false, noise: false } },
              { p: 'Add the halo. In my generator it is itself a band-pass: the cells blurred at σ 4.86 minus the cells blurred at σ 9.72, times 1.908 for this frame. Watch the scan. It lifts the inside of each cell and digs a dark moat round it.', state: { halo: true, ramp: false, noise: false } },
              { p: 'Add the illumination ramp, a tilted plane. For img_0002 it spans 1.226 from corner to corner, more than the brightest cell at 0.933. This is the one that breaks a global threshold. Dim cells in the dark corner fall under the line, and bright background in the other corner rises over it.', state: { halo: true, ramp: true, noise: false } },
              { p: 'Add Gaussian noise, σ 0.0116 here. That is img_0002 as it was saved. Open the sliders under the figure to move each layer over the generator’s own range.', state: { halo: true, ramp: true, noise: true } }
            ] },
          { callout: 'Real phase contrast usually shows a bright halo outside a darker cell. My halo has a sensible size but not that polarity. On a 16-pixel disk with this frame’s settings, it brightens the inside of the cell by up to 0.43 and digs a moat of −0.148 eight pixels outside the edge.^[scratchpad disk.py, 2026-10-16.] So everything below is measured against what I simulated, not against a microscope.', label: 'What I simulated' }
        ] },

      { id: 'notch', label: 'Plate 2', title: 'A notch, aimed a little wrong',
        blocks: [
          { p: 'The classical half of the pipeline is two blurs and a subtraction. Blur the frame at σ1 = 1 and at σ2 = 8, take the difference, and subtract 0.6 of it from the frame.' },
          { tex: '\\text{enhanced} = x - \\alpha\\,(G_{\\sigma_1} * x - G_{\\sigma_2} * x), \\quad \\sigma_1 = 1,\\ \\sigma_2 = 8,\\ \\alpha = 0.6', caption: '`src/preprocessor.py:58–63` at the defaults in `configs/default_config.yaml`.' },
          { p: 'I used to say σ2 was “wide enough to straddle the halo”. Frequencies are more honest. A Gaussian blur is a Gaussian in the frequency domain, so this whole step is one curve: the [[filter’s gain|filter]] at each period. The [[corruption|corrupt]] my generator added is another curve. If the filter undid the corruption exactly, their [[product|product]] would lie flat on 1.' },
          { widget: 'notch', size: 'wide', caption: 'Gain against period, for img_0002. The corruption curve uses the generator’s recorded halo for this frame; the filter uses the sliders, which have the demo page’s ranges. These are continuous Gaussian transfer functions computed in your browser, not measured from pixels. Product at 64 px: {{nprod|1.26}}; filter gain at 256 px: {{nh256|0.989}}.' },
          { p: 'It does not lie flat. At the defaults the filter cuts deepest at a 17.3-pixel period (gain 0.447), but this frame’s halo peaks at 31.8 pixels (1.90×). So at 64 px the product is still 1.26, halo left over, and at 16 px it is 0.59, cell detail cut. The two curves come from the same family, at different scales and with opposite signs. I never tuned one to the other.',
            notes: [['I never tuned one to the other', 'the old copy said they matched by construction. they don’t']] },
          { p: 'The shaded band on the right matters most. Every difference of Gaussians has a gain of exactly 1 at zero frequency, whatever you set, so a slow ramp goes straight through. At a 256-pixel period the default gain is 0.989. Nothing in this step can fix the light, and on the 20 held-out frames Otsu Dice after the DoG alone is 0.782, below the raw frames’ 0.894.^[scratchpad u8.py and evalval.py on the 20 held-out frames, repo code, 2026-10-16.]' },
          { p: 'One thing the old copy got right: the DoG does not hollow the cells out. Across the 20 true cells of img_0002, the centre-to-rim brightness ratio goes from 1.161 to 1.269. The rims dim more than the middles.' }
        ] },

      { id: 'clip', label: 'Plate 3', title: 'The slider that did nothing',
        art: function (c) {
          var h = [30, 70, 52, 88, 40, 64, 22, 48];
          return h.map(function (v, i) {
            return '<rect x="' + (18 + i * 16) + '" y="' + (110 - v) + '" width="11" height="' + v + '" fill="' + c.p + '" stroke="' + c.i + '" stroke-width="1"/>';
          }).join('') + '<line x1="10" y1="104" x2="150" y2="104" stroke="' + c.a + '" stroke-width="2" stroke-dasharray="5 4"/>';
        },
        blocks: [
          { p: 'After the DoG comes CLAHE, contrast-limited adaptive histogram equalisation. It cuts the frame into an 8×8 grid of tiles and equalises each tile’s histogram, so local contrast gets stretched. The “contrast-limited” part is a ceiling: no grey level in a tile may hold more than a set number of pixels, and the excess is spread over all levels. Without that ceiling, a flat patch of background is stretched until its noise fills the whole range.' },
          { p: 'Writing this up, I re-ran the classical half with the clip limit at every value from 0.5 to 40. The output was bit-identical every time.^[scratchpad clahe.py: cv2.createCLAHE on img_0002’s DoG output, clip 0.5, 1, 2, 5, 10 and 40, max |diff| 0 against clip 2 (2026-10-16).]' },
          { code: '# CLAHE requires an integer image; uint16 keeps more precision than uint8.\nimg_u16 = ((img - lo) / rng * 65535.0).astype(np.uint16)\n\nclahe = cv2.createCLAHE(clipLimit=clip, tileGridSize=grid)\neq_u16 = clahe.apply(img_u16)', lang: 'python', caption: '`src/preprocessor.py:84–90`, as shipped.' },
          { p: 'The comment is true, and it is the bug. OpenCV turns the clip limit into a pixel count per grey level: clip × tile area ÷ number of levels, and at least 1. A 256-pixel frame on an 8×8 grid has tiles of 1,024 pixels. In 8-bit there are 256 levels, so clip 2 means a ceiling of 8. In 16-bit there are 65,536 levels, 2 × 1,024 ÷ 65,536 is less than one, and the floor of 1 wins.',
            notes: [['The comment is true, and it is the bug.', 'more precision was exactly the problem']] },
          { widget: 'ceiling', size: 'full', caption: 'One real 32×32 tile of img_0002 after the DoG, quantised both ways. Bars are the tile’s true count per grey level; the dashed line is the ceiling OpenCV computes for the clip on the slider, and the part of a bar above it is clipped. The small squares apply this tile’s own lookup table to itself, without the blending between neighbouring tiles that full CLAHE does. They show the stretch, not the exact output. At clip {{clipv|2}}, 8-bit clips {{c8|—}} pixels and 16-bit clips {{c16|—}}.' },
          { p: 'So the clip limit never engaged, and CLAHE ran as plain per-tile equalisation. Flat background got stretched. The noise in the flattest quarter of the frame went from a standard deviation of 0.0184 after the DoG to 0.1293 after CLAHE, seven times more. The same CLAHE on uint8 gives 0.0410.^[scratchpad clahe.py: mean std of the flattest 16 of 64 tiles of img_0002.]' },
          { p: 'The demo page inherited it. Its clip slider runs from 0.5 to 10 over tile counts from 2 to 16, and for every tile count from 3 upward the ceiling is 1 at every clip value.^[Enumerated from the formula in docs/cv.js:157–165 over the ranges in docs/index.html:149 and 154.] I built a slider and never checked that it moved anything.' },
          { callout: 'The old version of this page said the classical stage scores below the raw frame “because CLAHE rewrites the tone curve”, and called that the metric behaving correctly. It was a bug. On the 20 held-out frames, the same pipeline with uint8 CLAHE scores 10.99 dB and Dice 0.875, against 7.39 dB and 0.480 as shipped. That is still not better than the raw frames, because nothing here touches the ramp, but it is no longer a collapse. The fix is one dtype.', label: 'Correction' }
        ] },

      { id: 'residual', label: 'Plate 4', title: 'What the network subtracts is mostly background',
        blocks: [
          { p: 'Hybrid mode feeds the classical output to a U-Net. It has four levels from 64 to 512 channels and a 1,024-channel bottleneck, uses GroupNorm instead of BatchNorm so small CPU batches behave, and holds 31,036,481 parameters. It trained for 15 epochs on 128-pixel crops from 80 frames.' },
          { tex: '\\hat{y} = \\operatorname{clamp}\\big(x - f_\\theta(x),\\,0,\\,1\\big), \\qquad \\mathcal{L} = \\big\\lVert f_\\theta(x) - (x - y) \\big\\rVert_1', caption: 'Inference and loss: `src/pipeline.py:94–100`, `src/trainer.py:216–218`. x is the classical output, y the truth.' },
          { p: 'It is not asked for the clean image. It is asked for the residual, the difference between its input and the truth, and the output is the input minus that. This is the idea behind DnCNN, and my plan called for it from the start.^[The project’s planning notes (local, untracked CLAUDE.md:76–84): “We do NOT train the UNet to output the clean image.”] I used to write that this meant “the network never draws a cell”. Drag the scan line and see.' },
          { widget: 'scrub', size: 'wide', caption: 'img_0002 through the network. Pixel values are read back from lossless images the repo’s own code wrote (tools/phase-stages.py). Drag across the pictures, or use the slider, to pick a row; the traces are that row. In the residual picture mid-grey is 0 and lighter is subtracted. Row {{row|168}}: residual {{rbg|—}} on background, {{rin|—}} in cells.' },
          { p: 'The [[residual|res]] is not a small correction. Across img_0002 its RMS is 0.359, against 0.540 for the [[input|in]] itself. It sits around 0.37 on background and 0.13 inside cells, and it peaks at cell edges, where the moats and the CLAHE overshoot are. Correlated with the true cells it scores −0.603. It is a picture of the cells, in negative.^[tools/phase-stages.py and scratchpad profile.py, img_0002, fp16 weights, 2026-10-16.]',
            notes: [['in negative', 'so it does know where the cells are']] },
          { p: 'So “never draws a cell” was wrong. A residual network is a shortcut plus a correction, and nothing stops the correction from knowing exactly where the cells are. Here it mostly removes background, meaning the ramp, the moats and the noise CLAHE amplified, and leaves the cell bodies alone. That is why the [[output|out]] follows the [[truth|truth]] so closely across the big cell on row 168.' }
        ] },

      { id: 'twenty', label: 'Plate 5', title: 'Twenty frames it never saw',
        blocks: [
          { p: 'The old headline was PSNR 12.87 → 20.62 dB, averaged over the six samples the demo bundles. Four of those six were training frames, and so were 17 of the 20 frames in the generated report.^[src/report.py:153–154 takes the first 20 files by name; scripts/make_demo_assets.py takes the first six; the split is src/dataset.py:128–134.] The trainer held out its own 20, picked by a seed-42 permutation. Those are the only fair test.' },
          { p: 'On those 20, hybrid lifts mean PSNR from 11.46 to 20.26 dB, and it wins on every one. The worst hybrid frame, 15.21 dB, still beats the best raw frame, 14.24. The training log’s best validation score was also 20.26, at epoch 14, which is an independent check.^[TensorBoard psnr/val in runs/ (local), 15 epochs; best 20.26 at epoch 14.]' },
          { widget: 'dots', size: 'wide', caption: 'Each dot is one held-out frame; lines join the same frame across the three paths, and img_0002 is ringed. Switch the metric. Hybrid beats raw on {{dwins|20 of 20}} frames.' },
          { p: 'Segmentation is the number I care about, and it tells a smaller story. Mean Otsu Dice moves from 0.894 to 0.907, and hybrid beats raw on only 7 of 20 frames. What changes is the floor. The worst raw frame, img_0059, scores 0.556; after hybrid it scores 0.901, and no hybrid frame drops below 0.808.',
            notes: [['only 7 of 20 frames', 'the other thirteen got worse, most by a little']] },
          { quote: 'It doesn’t segment better on average. It stops failing.' },
          { p: 'For this slide, img_0002 goes from 12.25 to 19.24 dB, and from Dice 0.894 to 0.905. On my laptop’s CPU the classical half takes 8 ms a frame and hybrid takes 785 ms (medians from a re-run; the repo commits no timing). Hybrid is not real time on a laptop.' }
        ] },

      { id: 'parity', label: 'Plate 6', title: 'Two implementations, one number',
        blocks: [
          { p: 'The classical half is arithmetic, so `docs/` runs it in the browser in plain JavaScript, with no OpenCV. That includes OpenCV’s kernel sizing, its reflected borders and the 65,536-level CLAHE. You can drag its sliders over six bundled samples or upload a frame of your own.' },
          { p: 'Two copies of the same maths drift apart quietly, so the port is measured rather than assumed. `scripts/verify_web_pipeline.py` sends the same pixels through both and fails below 40 dB. Re-run for this page, they agree to between 49.1 and 51.7 dB, and the JavaScript PSNR and SSIM match scikit-image exactly.^[python scripts/verify_web_pipeline.py, re-run 2026-10-16: 49.12 to 51.70 dB over the six samples, metric gap 0.00000.]' },
          { p: 'That faithfulness has a funny side: the port copied the clip-limit bug too, line for line. The U-Net column on the demo is precomputed, and the page says so. Uploads get the classical half and two measures that need no clean target: edge energy and background variance.',
            notes: [['copied the clip-limit bug too', 'faithful to a fault']] },
          { live: true }
        ] }
    ],

    closing: { blocks: [
      { list: [
        '**Quantise to uint8 before CLAHE**, or scale the clip limit by 256. On the held-out frames that one dtype takes the classical path from 7.39 to 10.99 dB and Dice from 0.480 to 0.875. Then retrain, because the network learned on the broken output.',
        '**Report on the held-out split only.** The report scores the first 20 files by name and the demo shows the first six, so both mostly re-measure training frames. The trainer already had the split; the report just didn’t use it.',
        '**Treat the ramp as its own problem.** No difference of Gaussians can touch it (gain 0.989 at 256 px), so it needs a background estimate, not a sharper notch. And the notch should sit on the halo’s band, 31.8 px here, not 17.3.',
        '**Simulate the right polarity, then leave the simulator.** A bright halo outside a darker cell first; then real micrographs with hand-drawn masks, because Dice against a synthetic mask only says how well I undo my own simulator.',
        '**Test that every control moves something.** A test that sweeps the clip limit and asserts the output changes would have caught this in July. The eight tests I had check the DoG and never the clip.'
      ] }
    ] },

    sources: [
      ['Rebuilt frame check', 'The Plate 1 widget’s live Otsu Dice with all layers on, 0.893 (Playwright, Chromium, 2026-10-18), against 0.894 for the committed img_0002 (val.json). The rebuild’s noise is a seeded stand-in, so the two are not expected to match exactly.'],
      ['Generator parameters and cells of img_0002', 'data/generate_synthetic.py:15–56, replayed at seed 42 and 256 px (scratchpad replay.py, 2026-10-16); bit-for-bit match with the committed PNGs on img_0000–0005. 20 cells; halo σ 4.862/9.724, strength 1.908; ramp gx 0.868, gy 0.569, amp 0.856, range 1.226; brightest cell 0.933; noise σ 0.0116.'],
      ['Halo polarity', 'scratchpad disk.py: a 16 px disk with img_0002’s halo settings, interior +0.43 at r = 8, moat −0.148 at r = 24.'],
      ['Classical defaults', 'configs/default_config.yaml:14–20 (σ1 1.0, σ2 8.0, α 0.6, clip 2.0, 8×8 grid).'],
      ['Transfer functions', 'scratchpad freq.py, continuous Gaussian transfer functions of src/preprocessor.py:58–63: minimum 0.447 at 17.3 px; corruption peak 1.90× at 31.8 px; product 1.26 at 64 px and 0.59 at 16 px; gain 0.989 at 256 px. Recomputed in the widget.'],
      ['Centre-to-rim ratio', 'scratchpad profile.py: 1.161 → 1.269 over img_0002’s 20 clean cells after DoG.'],
      ['Inert clip limit', 'scratchpad clahe.py (cv2, 2026-10-16): bit-identical output for clip 0.5–40; flattest-quarter std 0.0184 after DoG, 0.1293 after uint16 CLAHE, 0.0410 after uint8 CLAHE. Ceiling formula: OpenCV clahe.cpp, mirrored in docs/cv.js:157–165. Demo ranges: docs/index.html:149, 154.'],
      ['Tiles in the ceiling figure', 'tools/phase-stages.py: tiles (row 7, col 3), the flattest by std, and (row 5, col 1), on row 168’s big cell; counts and clipped pixels computed live from them.'],
      ['uint8 vs uint16 on held-out frames', 'scratchpad u8.py: cv_only 7.39 dB / Dice 0.480 as shipped, 10.99 dB / 0.875 with uint8 CLAHE; DoG alone Dice 0.782.'],
      ['Model', 'src/residual_unet.py; parameter count 31,036,481 summed over models/pretrained_fp16.pth; training config configs/default_config.yaml:30–42 (15 epochs, 128 px crops); split src/dataset.py:128–134 (80 train, 20 held out).'],
      ['Residual statistics', 'tools/phase-stages.py on img_0002: predicted RMS 0.359, image RMS 0.540, mean 0.369 on background and 0.133 in cells (truth > 0.25), correlation with cells −0.603.'],
      ['Held-out metrics', 'scratchpad evalval.py → val.json, repo code with fp16 weights on ids 2, 4, 18, 21, 24, 25, 27, 33, 42, 50, 51, 52, 56, 59, 61, 71, 81, 92, 97, 99: PSNR raw 11.46, hybrid 20.26 (20 of 20 better; worst hybrid 15.21, best raw 14.24); Dice raw 0.894 (min 0.556, img_0059), hybrid 0.907 (min 0.808), 7 of 20 better; img_0002 12.25 → 19.24 dB, Dice 0.894 → 0.905.'],
      ['Old six-sample figures', 'docs/samples/manifest.json: raw 12.87 dB, hybrid 20.62 dB; only img_0002 and img_0004 are held out.'],
      ['Validation curve', 'runs/events.out.tfevents.* (local, gitignored): best val PSNR 20.26 at epoch 14 of 15.'],
      ['Timing', 'scratchpad evalval.py on a laptop CPU, torch 2.13: median 8.0 ms cv_only, 784.8 ms hybrid per 256 px frame. Not committed in the repo.'],
      ['Browser parity', 'scripts/verify_web_pipeline.py, re-run 2026-10-16: 49.12–51.70 dB against OpenCV, PSNR/SSIM gap to scikit-image 0.00000.']
    ],

    widgets: {
      /* ---------- the rail: a slide and a 3× loupe ---------- */
      loupe: function (host, kit) {
        var CH = { lie: 'raw', notch: 'dog', clip: 'clahe', residual: 'residual', twenty: 'hybrid', parity: 'truth', differently: 'truth' };
        var ORDER = ['lie', 'notch', 'clip', 'residual', 'twenty', 'parity'];
        var LEDGER = {
          lie: ['20 cells, drawn by seed 42', 'halo ×1.908 at σ 4.86 / 9.72 px', 'ramp range 1.226 (brightest cell 0.933)', 'noise σ 0.0116'],
          notch: ['DoG gain at 256 px: 0.989', 'deepest cut 0.447 at 17.3 px; halo peak at 31.8 px'],
          clip: ['clip ceiling: 1 pixel per level (8-bit: 8)', 'background noise ×7.0: 0.0184 → 0.1293'],
          residual: ['residual 0.369 on background, 0.133 in cells', 'correlation with the cells −0.603'],
          twenty: ['PSNR 12.25 → 19.24 dB', 'Dice 0.894 → 0.905'],
          parity: ['browser vs OpenCV: 49.1–51.7 dB']
        };
        var stage = 'raw', lx = 0.25, ly = 0.66;
        host.appendChild(kit.el('p', { class: 'ph-loupe__k', text: 'Slide · img_0002 · held out' }));
        var img = kit.el('img', { class: 'ph-slide__img', src: IMG + 'raw.webp', alt: STAGE_ALT.raw, width: 256, height: 256 });
        var lens = kit.el('button', { type: 'button', class: 'ph-lens', 'aria-label': 'Magnifier, 3×. Arrow keys move it across the slide.' });
        var slide = kit.el('div', { class: 'ph-slide' }, img, lens);
        host.appendChild(slide);
        var legend = kit.el('p', { class: 'ph-loupe__legend', text: 'mid-grey = nothing subtracted; lighter = subtracted' });
        legend.hidden = true;
        host.appendChild(legend);
        var pick = kit.choice({ label: 'Stage', showLabel: false, value: 'raw',
          options: STAGES.map(function (s) { return { value: s, label: STAGE_LABEL[s] }; }),
          onChange: function (v) { show(v); } });
        pick.el.classList.add('ph-loupe__pick');
        host.appendChild(pick.el);
        var ledger = kit.el('ol', { class: 'ph-ledger', 'aria-label': 'Ledger: measured numbers so far' });
        var groups = ORDER.map(function (ch, i) {
          var li = kit.el('li', { class: 'ph-ledger__g' }, kit.el('span', { class: 'ph-ledger__p', text: 'Plate ' + (i + 1) }),
            kit.el('ul', null, LEDGER[ch].map(function (t) { return kit.el('li', { text: t }); })));
          ledger.appendChild(li);
          return li;
        });
        host.appendChild(ledger);

        function place() {
          var s = slide.getBoundingClientRect().width || 256, d = lens.offsetWidth || 96;
          lens.style.left = (lx * s - d / 2) + 'px';
          lens.style.top = (ly * s - d / 2) + 'px';
          lens.style.backgroundSize = (s * 3) + 'px ' + (s * 3) + 'px';
          lens.style.backgroundPosition = (-(lx * s * 3 - d / 2)) + 'px ' + (-(ly * s * 3 - d / 2)) + 'px';
        }
        function show(s) {
          stage = s;
          img.src = IMG + s + '.webp';
          img.alt = STAGE_ALT[s];
          lens.style.backgroundImage = 'url("' + IMG + s + '.webp")';
          legend.hidden = s !== 'residual';
          place();
        }
        function moveTo(p) { lx = kit.clamp(p.x / p.w, 0, 1); ly = kit.clamp(p.y / p.h, 0, 1); place(); }
        kit.drag(lens, { start: function (p, e) { moveTo(rel(e)); }, move: function (p, e) { moveTo(rel(e)); } });
        function rel(e) { var r = slide.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }; }
        slide.addEventListener('click', function (e) { if (e.target === slide || e.target === img) moveTo(rel(e)); });
        lens.addEventListener('keydown', function (e) {
          var st = e.shiftKey ? 0.12 : 0.04, k = e.key;
          if (k === 'ArrowLeft') lx -= st; else if (k === 'ArrowRight') lx += st;
          else if (k === 'ArrowUp') ly -= st; else if (k === 'ArrowDown') ly += st; else return;
          e.preventDefault();
          lx = kit.clamp(lx, 0, 1); ly = kit.clamp(ly, 0, 1); place();
        });
        if (window.ResizeObserver) new ResizeObserver(place).observe(slide);
        kit.onChapter(function (ch) {
          var n = ORDER.indexOf(ch); if (ch === 'differently') n = ORDER.length;
          groups.forEach(function (g, i) { g.hidden = i > Math.max(n, 0); g.classList.toggle('is-now', i === n); });
          if (CH[ch]) { pick.set(CH[ch], true); show(CH[ch]); }
        });
        groups.forEach(function (g, i) { g.hidden = i > 0; });
        show('raw');
      },

      /* ---------- Plate 1: make a microscope lie ---------- */
      microscope: function (host, kit) {
        var W = 256, ROW = 168, L = { halo: true, ramp: true, noise: true }, P = { s: GEN.s, amp: GEN.amp, sig: GEN.noise };
        var base = null;
        var frame = kit.el('canvas', { class: 'ph-gen__img', width: 256, height: 256, 'aria-hidden': 'true' });
        var plotHost = kit.el('div', { class: 'ph-gen__plot' });
        host.appendChild(kit.el('div', { class: 'ph-gen' }, frame, plotHost));
        var toggles = ['halo', 'ramp', 'noise'].map(function (k) {
          var b = kit.el('button', { type: 'button', class: 'k-btn ph-tog', 'aria-pressed': 'true', text: k === 'halo' ? '+ halo' : k === 'ramp' ? '+ ramp' : '+ noise',
            on: { click: function () { L[k] = !L[k]; sync(); draw(); } } });
          b._k = k; return b;
        });
        var dice = kit.readout('Otsu Dice, live', '—', 'k-readout--accent');
        host.appendChild(kit.el('div', { class: 'k-row ph-gen__row' }, kit.el('span', { class: 'ph-gen__cells', text: 'cells' }), toggles, dice.el));
        var sl = [
          kit.slider({ label: 'halo ×', min: 1.5, max: 3, step: 0.01, value: GEN.s, format: function (v) { return v.toFixed(2); }, onInput: function (v) { P.s = v; draw(); } }),
          kit.slider({ label: 'ramp amp', min: 0.6, max: 1, step: 0.01, value: GEN.amp, format: function (v) { return v.toFixed(2); }, onInput: function (v) { P.amp = v; draw(); } }),
          kit.slider({ label: 'noise σ', min: 0.01, max: 0.04, step: 0.001, value: GEN.noise, format: function (v) { return v.toFixed(3); }, onInput: function (v) { P.sig = v; draw(); } })
        ];
        var reset = kit.button('Back to img_0002', function () {
          sl[0].set(GEN.s); sl[1].set(GEN.amp); sl[2].set(GEN.noise);
        });
        host.appendChild(kit.el('details', { class: 'ph-gen__more' }, kit.el('summary', { text: 'Sliders: the generator’s own ranges' }),
          kit.el('div', { class: 'k-row' }, sl.map(function (s) { return s.el; }), reset)));

        function sync() { toggles.forEach(function (b) { b.setAttribute('aria-pressed', String(L[b._k])); }); }
        function build() {
          var c = new Float32Array(W * W), i, x, y;
          CELLS.forEach(function (e) {
            var th = e[4] * Math.PI / 180, co = Math.cos(th), si = Math.sin(th), R = Math.max(e[2], e[3]) + 1;
            for (y = Math.max(0, e[1] - R); y <= Math.min(W - 1, e[1] + R); y++)
              for (x = Math.max(0, e[0] - R); x <= Math.min(W - 1, e[0] + R); x++) {
                var dx = x - e[0], dy = y - e[1], u = dx * co + dy * si, v = -dx * si + dy * co;
                if ((u * u) / (e[2] * e[2]) + (v * v) / (e[3] * e[3]) <= 1) c[y * W + x] = e[5];
              }
          });
          c = blur(c, W, W, 1.5);
          for (i = 0; i < c.length; i++) c[i] = Math.min(1, Math.max(0, c[i]));
          var bs = blur(c, W, W, GEN.hs), bl = blur(c, W, W, GEN.hl), halo = new Float32Array(W * W), ramp = new Float32Array(W * W), nz = new Float32Array(W * W);
          var r = kit.rng(42);
          for (i = 0; i < W * W; i++) {
            halo[i] = bs[i] - bl[i];
            ramp[i] = GEN.gx * (i % W) / W + GEN.gy * Math.floor(i / W) / W;
            var u1 = r() || 1e-9, u2 = r();
            nz[i] = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
          }
          var cu = toU8(c), ct = otsu(cu), cm = new Uint8Array(W * W);
          for (i = 0; i < W * W; i++) cm[i] = cu[i] > ct ? 1 : 0;
          base = { clean: c, halo: halo, ramp: ramp, noise: nz, mask: cm, cleanU8: cu };
        }
        var last = null;
        function draw() {
          if (!base) return;
          var f = new Float32Array(W * W), i;
          for (i = 0; i < W * W; i++) {
            f[i] = base.clean[i] + (L.halo ? P.s * base.halo[i] : 0) + (L.ramp ? P.amp * base.ramp[i] : 0) + (L.noise ? P.sig * base.noise[i] : 0);
          }
          var u = toU8(f), t = otsu(u), inter = 0, a = 0, b = 0;
          for (i = 0; i < W * W; i++) { var m = u[i] > t ? 1 : 0; a += m; b += base.mask[i]; if (m && base.mask[i]) inter++; }
          var d = 2 * inter / (a + b);
          dice.set(d.toFixed(3));
          kit.live('gdice', d.toFixed(3));
          last = { u: u, t: t };
          var cx = frame.getContext('2d');
          paintGray(cx, u, 0, 0, 256);
          var col = kit.colors();
          cx.fillStyle = col.series[0];
          cx.globalAlpha = 0.35;
          for (i = 0; i < W * W; i++) if (u[i] > t) cx.fillRect(i % W, Math.floor(i / W), 1, 1);
          cx.globalAlpha = 1;
          cx.strokeStyle = col.accent; cx.lineWidth = 2; cx.setLineDash([4, 3]);
          cx.beginPath(); cx.moveTo(0, ROW + 0.5); cx.lineTo(W, ROW + 0.5); cx.stroke(); cx.setLineDash([]);
          redrawPlot();
          kit.announce('Otsu Dice ' + d.toFixed(3));
        }
        var redrawPlot = sized(plotHost, function (w) {
          if (!last) return;
          var col = kit.colors(), h = Math.min(w, 256), pad = 18, s = kit.svg;
          var X = function (x) { return pad + x / 255 * (w - pad * 2); }, Y = function (v) { return h - 22 - v * (h - 44); };
          var fr = [], tr = [], x;
          for (x = 0; x < W; x++) { fr.push(X(x).toFixed(1) + ',' + Y(last.u[ROW * W + x] / 255).toFixed(1)); tr.push(X(x).toFixed(1) + ',' + Y(base.cleanU8[ROW * W + x] / 255).toFixed(1)); }
          var g = s('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', class: 'ph-svg' },
            s('rect', { x: 0, y: 0, width: w, height: h, fill: col.bgSunken, rx: 6 }),
            s('polyline', { points: tr.join(' '), fill: 'none', stroke: col.inkMuted, 'stroke-width': 1.5, 'stroke-dasharray': '2 3' }),
            s('polyline', { points: fr.join(' '), fill: 'none', stroke: col.ink, 'stroke-width': 1.5 }),
            s('line', { x1: pad, x2: w - pad, y1: Y(last.t / 255), y2: Y(last.t / 255), stroke: col.accent, 'stroke-width': 1.5, 'stroke-dasharray': '6 4' }),
            s('text', { x: w - pad, y: Y(last.t / 255) - 5, 'text-anchor': 'end', fill: col.accentInk, text: 'Otsu' }),
            s('text', { x: pad, y: 14, fill: col.inkSoft, text: 'row 168' }));
          plotHost.textContent = '';
          plotHost.appendChild(g);
        });
        kit.onTheme(draw);
        kit.onVisible(function (v) { if (v && !base) { build(); draw(); } });
        return { set: function (st) {
          L.halo = !!st.halo; L.ramp = !!st.ramp; L.noise = !!st.noise; sync();
          if (base) draw();
        } };
      },

      /* ---------- Plate 2: the band-stop ---------- */
      notch: function (host, kit) {
        var P = { s1: 1, s2: 8, a: 0.6 }, dim = null;
        var E = Math.exp, PI2 = 2 * Math.PI * Math.PI;
        function H(f) { return 1 - P.a * (E(-PI2 * P.s1 * P.s1 * f * f) - E(-PI2 * P.s2 * P.s2 * f * f)); }
        function C(f) { return 1 + GEN.s * (E(-PI2 * GEN.hs * GEN.hs * f * f) - E(-PI2 * GEN.hl * GEN.hl * f * f)); }
        var plot = kit.el('div', { class: 'ph-notch' });
        host.appendChild(plot);
        var warn = kit.el('p', { class: 'ph-warn', role: 'status' });
        var sl = [
          kit.slider({ label: 'σ1', min: 0.2, max: 6, step: 0.1, value: 1, format: function (v) { return v.toFixed(1); }, onInput: function (v) { P.s1 = v; redraw(true); } }),
          kit.slider({ label: 'σ2', min: 1, max: 24, step: 0.5, value: 8, format: function (v) { return v.toFixed(1); }, onInput: function (v) { P.s2 = v; redraw(true); } }),
          kit.slider({ label: 'α', min: 0, max: 2, step: 0.05, value: 0.6, format: function (v) { return v.toFixed(2); }, onInput: function (v) { P.a = v; redraw(true); } })
        ];
        host.appendChild(kit.el('div', { class: 'k-row' }, sl.map(function (s) { return s.el; }),
          kit.button('Defaults', function () { sl[0].set(1, true); sl[1].set(8, true); sl[2].set(0.6, true); P = { s1: 1, s2: 8, a: 0.6 }; redraw(true); })));
        var r1 = kit.readout('Product at 64 px', ''), r2 = kit.readout('Product at 16 px', ''), r3 = kit.readout('Filter at 256 px', '', 'k-readout--accent'), r4 = kit.readout('Deepest cut', '');
        host.appendChild(kit.el('div', { class: 'k-row ph-readouts' }, r1.el, r2.el, r3.el, r4.el));
        host.appendChild(warn);
        kit.onKey(function (k) { dim = k; redraw(); });

        var render = sized(plot, function (w) {
          var col = kit.colors(), s = kit.svg; setSeries(host, col);
          var h = w < 500 ? 240 : 300, l = 36, r = 12, t = 14, b = 34, ok = P.s2 > P.s1;
          var X = function (p) { return l + (Math.log(p / 2) / Math.log(128)) * (w - l - r); };
          var Y = function (g) { return t + (1 - g / 2.2) * (h - t - b); };
          function path(fn) { var d = ''; for (var i = 0; i <= 200; i++) { var p = 2 * Math.pow(128, i / 200); d += (i ? 'L' : 'M') + X(p).toFixed(1) + ' ' + Y(kit.clamp(fn(1 / p), -0.1, 2.2)).toFixed(1); } return d; }
          var op = function (k) { return dim && dim !== k ? 0.18 : 1; };
          var g = s('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, class: 'ph-svg', 'aria-hidden': 'true' });
          g.appendChild(s('rect', { x: X(128), y: t, width: X(256) - X(128), height: h - t - b, fill: col.accentTint }));
          g.appendChild(s('text', { x: X(256) - 4, y: t + 14, 'text-anchor': 'end', fill: col.inkSoft, text: 'ramp: no setting' }));
          g.appendChild(s('text', { x: X(256) - 4, y: t + 28, 'text-anchor': 'end', fill: col.inkSoft, text: 'touches this' }));
          [2, 4, 8, 16, 32, 64, 128, 256].forEach(function (p) {
            g.appendChild(s('line', { x1: X(p), x2: X(p), y1: h - b, y2: h - b + 4, stroke: col.lineStrong }));
            g.appendChild(s('text', { x: X(p), y: h - b + 17, 'text-anchor': 'middle', fill: col.inkMuted, text: String(p) }));
          });
          g.appendChild(s('text', { x: (l + w - r) / 2, y: h - 4, 'text-anchor': 'middle', fill: col.inkMuted, text: 'period (px)' }));
          [0, 0.5, 1, 1.5, 2].forEach(function (v) { g.appendChild(s('text', { x: l - 6, y: Y(v) + 4, 'text-anchor': 'end', fill: col.inkMuted, text: String(v) })); });
          g.appendChild(s('line', { x1: l, x2: w - r, y1: Y(1), y2: Y(1), stroke: col.lineStrong, 'stroke-dasharray': '3 4' }));
          g.appendChild(s('path', { d: path(C), fill: 'none', stroke: col.series[1], 'stroke-width': 2, 'stroke-dasharray': '7 4', opacity: op('corrupt') }));
          if (ok) {
            g.appendChild(s('path', { d: path(H), fill: 'none', stroke: col.series[0], 'stroke-width': 2, opacity: op('filter') }));
            g.appendChild(s('path', { d: path(function (f) { return H(f) * C(f); }), fill: 'none', stroke: col.ink, 'stroke-width': 3, opacity: op('product') }));
          }
          var lab = function (txt, p, fn, c, k) { g.appendChild(s('text', { x: X(p), y: Y(fn(1 / p)) - 8, 'text-anchor': 'middle', fill: c, opacity: op(k), class: 'ph-svg__lab', text: txt })); };
          lab('corruption', 31.8, C, col.ink, 'corrupt');
          if (ok) { lab('filter', 8, H, col.ink, 'filter'); lab('product', 90, function (f) { return H(f) * C(f); }, col.ink, 'product'); }
          plot.textContent = ''; plot.appendChild(g);
          warn.textContent = ok ? '' : 'σ2 must be larger than σ1: the code raises a ValueError here.';
        });
        function redraw(user) {
          render();
          var ok = P.s2 > P.s1, m = 9, mp = 0;
          for (var p = 2; p <= 256; p += 0.1) { var v = H(1 / p); if (v < m) { m = v; mp = p; } }
          var p64 = ok ? f2(H(1 / 64) * C(1 / 64)) : '—', p16 = ok ? f2(H(1 / 16) * C(1 / 16)) : '—', h256 = ok ? f2(H(1 / 256), 3) : '—';
          r1.set(p64); r2.set(p16); r3.set(h256); r4.set(ok ? f2(m, 3) + ' at ' + f2(mp, 1) + ' px' : '—');
          kit.live('nprod', p64); kit.live('nh256', h256);
          if (user) kit.announce('product at 64 px ' + p64 + ', at 16 px ' + p16);
        }
        kit.onTheme(function () { redraw(); });
        redraw();
      },

      /* ---------- Plate 3: where the ceiling is ---------- */
      ceiling: function (host, kit) {
        var tile = 'background', clip = 2;
        var top = kit.el('div', { class: 'k-row' });
        var pick = kit.choice({ label: 'Tile', value: 'background', options: [
          { value: 'background', label: 'Flattest background' }, { value: 'cell', label: 'Cell on row 168' }],
          onChange: function (v) { tile = v; draw(); } });
        var sl = kit.slider({ label: 'clip limit', min: 0.5, max: 10, step: 0.5, value: 2, format: function (v) { return v.toFixed(1); },
          onInput: function (v) { clip = v; draw(true); } });
        top.appendChild(pick.el); top.appendChild(sl.el);
        host.appendChild(top);
        var panes = [8, 16].map(function (bits) {
          var hist = kit.el('div', { class: 'ph-ceil__hist' });
          var before = kit.el('canvas', { class: 'ph-ceil__tile', width: 32, height: 32, 'aria-hidden': 'true' });
          var after = kit.el('canvas', { class: 'ph-ceil__tile', width: 32, height: 32, 'aria-hidden': 'true' });
          var r1 = kit.readout('Ceiling', ''), r2 = kit.readout('Pixels clipped', '', 'k-readout--accent'), r3 = kit.readout('Tile std after', '');
          var el = kit.el('div', { class: 'ph-ceil__pane' },
            kit.el('h4', { class: 'ph-ceil__h', text: bits === 8 ? '8-bit · 256 levels' : '16-bit · 65,536 levels (as shipped)' }),
            hist,
            kit.el('div', { class: 'ph-ceil__tiles' },
              kit.el('figure', null, before, kit.el('figcaption', { text: 'tile, frame scale' })),
              kit.el('figure', null, after, kit.el('figcaption', { text: 'after its own LUT' }))),
            kit.el('div', { class: 'k-row ph-readouts' }, r1.el, r2.el, r3.el));
          host.appendChild(el);
          return { bits: bits, hist: hist, before: before, after: after, r1: r1, r2: r2, r3: r3, render: null };
        });
        host.firstChild.after(kit.el('div', { class: 'ph-ceil' }, panes.map(function (p) { return p.hist.parentNode; })));

        function one(p) {
          var T = TILES[tile], px = p.bits === 8 ? T.u8 : T.u16, bins = p.bits === 8 ? 256 : 65536, top = bins - 1;
          var res = tileLut(px, bins, clip);
          var counts = {}, i, lo = Infinity, hi = -Infinity, mx = 0;
          for (i = 0; i < px.length; i++) { var v = px[i]; counts[v] = (counts[v] || 0) + 1; if (v < lo) lo = v; if (v > hi) hi = v; }
          Object.keys(counts).forEach(function (k) { if (counts[k] > mx) mx = counts[k]; });
          var bu = new Uint8Array(1024), au = new Uint8Array(1024), m = 0, sq = 0;
          for (i = 0; i < 1024; i++) { bu[i] = Math.round(px[i] / top * 255); var a = res.lut[px[i]] / top; au[i] = Math.round(a * 255); m += a; sq += a * a; }
          m /= 1024;
          paintGray(p.before.getContext('2d'), bu, 0, 0, 32, 32);
          paintGray(p.after.getContext('2d'), au, 0, 0, 32, 32);
          p.r1.set(res.ceil + (res.ceil === 1 ? ' pixel per level' : ' pixels per level'));
          p.r2.set(res.clipped + ' of 1,024');
          p.r3.set(Math.sqrt(Math.max(0, sq / 1024 - m * m)).toFixed(3));
          p.data = { counts: counts, lo: lo, hi: hi, mx: mx, ceil: res.ceil };
          return res.clipped;
        }
        panes.forEach(function (p) {
          p.render = sized(p.hist, function (w) {
            if (!p.data) return;
            var col = kit.colors(), s = kit.svg, h = 170, l = 30, r = 8, t = 16, b = 22, d = p.data;
            var ymax = Math.max(d.mx, d.ceil) * 1.15;
            var X = function (v) { return l + (v - d.lo) / Math.max(1, d.hi - d.lo) * (w - l - r); };
            var Y = function (c) { return t + (1 - c / ymax) * (h - t - b); };
            var g = s('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, class: 'ph-svg', 'aria-hidden': 'true' });
            var levels = d.hi - d.lo + 1, bw = Math.max(1, (w - l - r) / levels - (levels < 80 ? 1 : 0));
            Object.keys(d.counts).forEach(function (k) {
              var v = Number(k), c = d.counts[k], x = X(v) - (levels < 300 ? bw / 2 : 0);
              var under = Math.min(c, d.ceil);
              g.appendChild(s('rect', { x: x, y: Y(under), width: bw, height: Y(0) - Y(under), fill: col.inkSoft }));
              if (c > d.ceil) g.appendChild(s('rect', { x: x, y: Y(c), width: bw, height: Y(d.ceil) - Y(c), fill: col.series[1] }));
            });
            g.appendChild(s('line', { x1: l, x2: w - r, y1: Y(0), y2: Y(0), stroke: col.lineStrong }));
            g.appendChild(s('line', { x1: l, x2: w - r, y1: Y(d.ceil), y2: Y(d.ceil), stroke: col.accent, 'stroke-width': 2, 'stroke-dasharray': '6 4' }));
            g.appendChild(s('text', { x: w - r, y: Y(d.ceil) - 5, 'text-anchor': 'end', fill: col.accentInk, class: 'ph-svg__lab', text: 'ceiling ' + d.ceil }));
            g.appendChild(s('text', { x: l - 5, y: Y(d.mx) + 4, 'text-anchor': 'end', fill: col.inkMuted, text: String(d.mx) }));
            g.appendChild(s('text', { x: l - 5, y: Y(0) + 4, 'text-anchor': 'end', fill: col.inkMuted, text: '0' }));
            g.appendChild(s('text', { x: l, y: h - 5, fill: col.inkMuted, text: 'level ' + d.lo }));
            g.appendChild(s('text', { x: w - r, y: h - 5, 'text-anchor': 'end', fill: col.inkMuted, text: String(d.hi) }));
            g.appendChild(s('text', { x: l, y: 11, fill: col.inkMuted, text: 'pixels per level · above the line: clipped' }));
            p.hist.textContent = ''; p.hist.appendChild(g);
          });
        });
        function draw(user) {
          var c8 = one(panes[0]), c16 = one(panes[1]);
          panes.forEach(function (p) { p.render(); });
          kit.live('clipv', clip.toFixed(1)); kit.live('c8', kit.fmt(c8)); kit.live('c16', kit.fmt(c16));
          if (user) kit.announce('clip ' + clip + ': 8-bit clips ' + c8 + ' pixels, 16-bit clips ' + c16);
        }
        kit.onTheme(function () { panes.forEach(function (p) { p.render(); }); });
        draw();
      },

      /* ---------- Plate 4: scrub the subtraction ---------- */
      scrub: function (host, kit) {
        var row = 168, dim = null, P = null;
        var names = [['clahe', 'Input (classical output)'], ['residual', 'Residual'], ['hybrid', 'Output']];
        var pics = names.map(function (n) {
          var c = kit.el('canvas', { class: 'ph-scrub__img', width: 256, height: 256, 'aria-hidden': 'true' });
          return { key: n[0], c: c, fig: kit.el('figure', { class: 'ph-scrub__fig' }, c, kit.el('figcaption', { text: n[1] })) };
        });
        var strip = kit.el('div', { class: 'ph-scrub__strip' }, pics.map(function (p) { return p.fig; }));
        host.appendChild(strip);
        var plot = kit.el('div', { class: 'ph-scrub__plot' });
        host.appendChild(plot);
        var sl = kit.slider({ label: 'Row', min: 0, max: 255, step: 1, value: 168, onInput: function (v) { row = v; draw(); } });
        host.appendChild(kit.el('div', { class: 'k-row' }, sl.el,
          kit.el('p', { class: 'ph-key' },
            kit.el('span', { class: 'ph-key__in', text: 'input' }), kit.el('span', { class: 'ph-key__res', text: 'residual' }),
            kit.el('span', { class: 'ph-key__out', text: 'output' }), kit.el('span', { class: 'ph-key__truth', text: 'truth' }))));
        kit.drag(strip, { axis: 'x', start: pick, move: pick });
        function pick(p, e) {
          var c = e.target.closest ? e.target.closest('canvas') : null; c = c || pics[0].c;
          var r = c.getBoundingClientRect();
          sl.set(kit.clamp(Math.round((e.clientY - r.top) / r.height * 255), 0, 255));
        }
        kit.onKey(function (k) { dim = k; render(); });
        var render = sized(plot, function (w) {
          if (!P) return;
          var col = kit.colors(), s = kit.svg, h = w < 500 ? 200 : 240, l = 34, r = 8, t = 10, b = 20; setSeries(host, col);
          var X = function (x) { return l + x / 255 * (w - l - r); }, Y = function (v) { return t + (1 - (v + 0.25) / 1.25) * (h - t - b); };
          var op = function (k) { return dim && dim !== k ? 0.15 : 1; };
          function line(arr, f, stroke, width, dash, k) {
            var pts = []; for (var x = 0; x < 256; x++) pts.push(X(x).toFixed(1) + ',' + Y(f(arr[row * 256 + x])).toFixed(1));
            return s('polyline', { points: pts.join(' '), fill: 'none', stroke: stroke, 'stroke-width': width, 'stroke-dasharray': dash || null, opacity: op(k), 'stroke-linejoin': 'round' });
          }
          var u = function (v) { return v / 255; }, rr = function (v) { return v / 255 * 2 - 1; };
          var g = s('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, class: 'ph-svg', 'aria-hidden': 'true' });
          [0, 0.5, 1].forEach(function (v) {
            g.appendChild(s('line', { x1: l, x2: w - r, y1: Y(v), y2: Y(v), stroke: col.line, 'stroke-dasharray': v ? '2 4' : null }));
            g.appendChild(s('text', { x: l - 5, y: Y(v) + 4, 'text-anchor': 'end', fill: col.inkMuted, text: String(v) }));
          });
          g.appendChild(line(P.truth, u, col.inkSoft, 2, '1 3', 'truth'));
          g.appendChild(line(P.clahe, u, col.series[0], 1.4, null, 'in'));
          g.appendChild(line(P.residual, rr, col.series[1], 1.8, '6 3', 'res'));
          g.appendChild(line(P.hybrid, u, col.series[2], 2.6, null, 'out'));
          g.appendChild(s('text', { x: l, y: h - 4, fill: col.inkMuted, text: 'column 0' }));
          g.appendChild(s('text', { x: w - r, y: h - 4, 'text-anchor': 'end', fill: col.inkMuted, text: '255 · row ' + row }));
          plot.textContent = ''; plot.appendChild(g);
        });
        function draw() {
          if (!P) return;
          var col = kit.colors();
          pics.forEach(function (p) {
            var cx = p.c.getContext('2d'); paintGray(cx, P[p.key], 0, 0, 256);
            cx.strokeStyle = col.accent; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(0, row + 0.5); cx.lineTo(256, row + 0.5); cx.stroke();
          });
          var sb = 0, nb = 0, si = 0, ni = 0;
          for (var x = 0; x < 256; x++) {
            var i = row * 256 + x, v = P.residual[i] / 255 * 2 - 1;
            if (P.truth[i] > 0.25 * 255) { si += v; ni++; } else { sb += v; nb++; }
          }
          kit.live('row', String(row));
          kit.live('rbg', nb ? f2(sb / nb) : '—'); kit.live('rin', ni ? f2(si / ni) : 'no cells');
          render();
        }
        kit.onTheme(draw);
        kit.onVisible(function (v) {
          if (!v || P) return;
          var need = ['clahe', 'residual', 'hybrid', 'truth'], got = {};
          need.forEach(function (n) { pixels(n, function (g) { got[n] = g; if (Object.keys(got).length === need.length) { P = got; draw(); } }); });
        });
      },

      /* ---------- Plate 5: twenty frames ---------- */
      dots: function (host, kit) {
        var metric = 'psnr', cur = null, anim = null;
        var plot = kit.el('div', { class: 'ph-dots' });
        var ch = kit.choice({ label: 'Metric', value: 'psnr', options: [{ value: 'psnr', label: 'PSNR (dB)' }, { value: 'dice', label: 'Otsu Dice' }],
          onChange: function (v) { metric = v; go(true); } });
        var r1 = kit.readout('Hybrid beats raw', '', 'k-readout--accent'), r2 = kit.readout('Mean, raw → hybrid', ''), r3 = kit.readout('Worst frame, raw → hybrid', '');
        host.appendChild(kit.el('div', { class: 'k-row' }, ch.el));
        host.appendChild(plot);
        host.appendChild(kit.el('div', { class: 'k-row ph-readouts' }, r1.el, r2.el, r3.el));
        var COLS = [['raw', 'raw'], ['cv', 'classical'], ['hy', 'hybrid']];
        function target(m) {
          var d = VAL[m], all = d.raw.concat(d.cv, d.hy), lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
          var pad = (hi - lo) * 0.06; lo -= pad; hi += pad;
          return { lo: lo, hi: hi, v: COLS.map(function (c) { return d[c[0]].map(function (x) { return (x - lo) / (hi - lo); }); }) };
        }
        var render = sized(plot, function (w) { paint(w); });
        var W = 0;
        function paint(w) {
          W = w || W; w = W; if (!cur || !w) return;
          var col = kit.colors(), s = kit.svg, h = w < 500 ? 280 : 320, t = 16, b = 30, l = 46, r = 64;
          var X = function (i) { return l + 40 + i * (w - l - r - 80) / 2; }, Y = function (v) { return t + (1 - v) * (h - t - b); };
          var g = s('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, class: 'ph-svg', 'aria-hidden': 'true' });
          for (var k = 0; k <= 4; k++) {
            var v = k / 4, val = cur.lo + v * (cur.hi - cur.lo);
            g.appendChild(s('line', { x1: l, x2: w - r, y1: Y(v), y2: Y(v), stroke: col.line }));
            g.appendChild(s('text', { x: l - 6, y: Y(v) + 4, 'text-anchor': 'end', fill: col.inkMuted, text: metric === 'psnr' ? val.toFixed(1) : val.toFixed(2) }));
          }
          COLS.forEach(function (c, i) { g.appendChild(s('text', { x: X(i), y: h - 8, 'text-anchor': 'middle', fill: col.inkSoft, text: c[1] })); });
          for (var f = 0; f < 20; f++) {
            var up = VAL[metric].hy[f] > VAL[metric].raw[f], me = VAL_IDS[f] === 2;
            g.appendChild(s('polyline', { points: [0, 1, 2].map(function (i) { return X(i) + ',' + Y(cur.v[i][f]); }).join(' '), fill: 'none',
              stroke: me ? col.accent : up ? col.lineStrong : col.series[1], 'stroke-width': me ? 2 : 1, opacity: me ? 1 : 0.8,
              'stroke-dasharray': up ? null : '4 3' }));
          }
          for (f = 0; f < 20; f++) {
            for (var i = 0; i < 3; i++) {
              var mine = VAL_IDS[f] === 2;
              g.appendChild(s('circle', { cx: X(i), cy: Y(cur.v[i][f]), r: mine ? 5 : 3.5, fill: col.series[i], stroke: mine ? col.ink : 'none', 'stroke-width': 2 }));
            }
          }
          var mi = VAL_IDS.indexOf(2);
          g.appendChild(s('text', { x: X(2) + 10, y: Y(cur.v[2][mi]) + 4, fill: col.ink, class: 'ph-svg__lab', text: 'img_0002' }));
          plot.textContent = ''; plot.appendChild(g);
        }
        function go(user) {
          var d = VAL[metric], wins = 0, i;
          for (i = 0; i < 20; i++) if (d.hy[i] > d.raw[i]) wins++;
          var mean = function (a) { return a.reduce(function (x, y) { return x + y; }, 0) / a.length; }, dp = metric === 'psnr' ? 2 : 3;
          r1.set(wins + ' of 20'); kit.live('dwins', wins + ' of 20');
          r2.set(f2(mean(d.raw), dp) + ' → ' + f2(mean(d.hy), dp));
          r3.set(f2(Math.min.apply(null, d.raw), dp) + ' → ' + f2(Math.min.apply(null, d.hy), dp));
          var to = target(metric);
          if (!cur || kit.reduced || !user) { cur = to; paint(); return; }
          var from = cur, t0 = 0;
          if (anim) anim.stop();
          anim = kit.loop(function (dt, t) {
            var p = Math.min(1, t / 0.45), e = 1 - Math.pow(1 - p, 3);
            cur = { lo: to.lo, hi: to.hi, v: to.v.map(function (col, i) { return col.map(function (v, f) { return kit.lerp(from.v[i][f], v, e); }); }) };
            paint();
            if (p >= 1) return false;
          });
          anim.start();
          if (!kit.visible) { cur = to; paint(); }
          kit.announce('Hybrid beats raw on ' + wins + ' of 20 frames');
        }
        kit.onTheme(function () { paint(); });
        go(); render();
      }
    }
  });
})();
