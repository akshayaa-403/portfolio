/* Phase-Contrast Clean-Up, as rebuilt in commit 84bb506 (2026-11-11).
   Every number here is in `sources`. Per-frame values are copied from the
   repo's docs/samples/manifest.json; the CLAHE tiles were cut from
   docs/samples/img_0002_noisy.png by the repo's own preprocessor. */
(function () {
  'use strict';

  /* Per-frame validation metrics, 20 frames (docs/samples/manifest.json).
     These frames chose the checkpoint and the classical defaults. */
  var VAL_IDS = [2, 4, 18, 21, 24, 25, 27, 33, 42, 50, 51, 52, 56, 59, 61, 71, 81, 92, 97, 99];
  var VAL = {
    psnr: {
      raw: [1.173,1.144,0.376,0.789,1.148,0.819,2.485,1.536,0.865,2.719,0.627,1.089,1.902,1.643,2.631,1.23,2.155,0.848,1.048,0.961],
      cv: [15.655,13.993,17.05,15.951,13.387,15.59,14.46,16.712,15.358,13.881,18.278,14.286,14.82,14.86,13.987,13.668,12.1,16.384,14.726,15.859],
      hy: [28.671,28.492,32.415,30.09,27.084,25.01,25.293,33.015,29.89,30.935,33.192,27.116,26.723,27.194,31.876,28.954,25.223,31.267,28.298,28.625]
    },
    dice: {
      raw: [0.0848,0.1262,0.069,0.0844,0.1246,0.1127,0.121,0.0344,0.0741,0.0201,0.0584,0.1079,0.0817,0.0846,0.1046,0.0694,0.0966,0.0493,0.1085,0.0492],
      cv: [0.6769,0.6331,0.4376,0.5728,0.6236,0.6062,0.6748,0.5554,0.5605,0.635,0.6128,0.5952,0.6109,0.6209,0.6274,0.5527,0.5561,0.4847,0.5696,0.6017],
      hy: [0.9504,0.953,0.9312,0.9635,0.9476,0.9391,0.9305,0.9697,0.9626,0.9662,0.9619,0.9495,0.939,0.9662,0.9742,0.9579,0.9578,0.9579,0.9157,0.9392]
    }
  };

  /* Two real 32x32 CLAHE tiles (8x8 grid on 256 px) of img_0002 after polarity,
     background flattening and the DoG, at the defaults in
     configs/default_config.yaml, quantised the way apply_clahe does it in
     uint16 and in uint8. `background` is the flattest tile with no cell in the
     truth; `cell` is the tile the truth covers most. */
  var TILES = {"background":{"ty":0,"tx":7,"u16":[8821,8995,8700,8966,9144,9211,9649,9172,9085,8820,8970,8678,9189,9164,9663,9362,9012,9135,9209,9526,9066,8621,9729,8829,9183,9235,8405,9375,8796,9342,9023,9281,9601,9144,9416,9640,8839,9499,9209,9169,9022,8664,10019,9141,8906,9029,8661,8790,9314,9259,8701,9366,9599,9293,9040,9230,9019,9481,8965,9630,9089,8855,9130,9311,9418,9015,9111,9312,8525,9170,8832,9548,9138,9766,9418,8234,9734,9440,8906,9687,9528,9216,9038,8891,9498,9105,9201,9392,8922,9490,8695,9342,9228,9738,9207,8857,9364,9489,9228,9210,9492,8827,9434,8951,9015,8361,9288,9208,9709,8331,9109,8489,9146,9258,9362,9165,8849,9390,9270,9122,9204,9257,9219,9415,8942,8183,8993,9569,9228,9291,8594,9116,9724,9335,8955,9099,9539,9685,9198,9068,9150,9185,9888,9768,8543,8925,9169,9278,9901,9309,8656,10050,9309,9145,8827,8890,9420,9192,9497,8791,9363,8754,9267,9002,9053,9148,9518,9387,9108,9123,8705,9403,9019,8739,8649,9040,9548,9291,9510,8917,8791,9415,8672,9210,8937,9331,9621,8774,9581,9245,9428,9535,10051,8539,9807,9495,9062,8983,8910,8865,9635,9273,8909,9179,9527,9818,9094,9358,8801,9414,9054,9740,8650,9505,9232,9035,8978,8985,8794,10455,8592,8714,9287,9006,9498,8823,9297,8866,9684,9124,8891,9638,9256,9069,9437,9479,8997,9778,8708,9292,9882,9115,9259,9176,9070,9334,9932,9475,9405,9303,9021,9114,8804,9308,8794,8969,9709,8961,9406,9349,9282,9429,9586,9087,9301,8737,9531,8744,8890,8957,9605,8774,8490,8959,9208,9191,9440,8962,8814,8699,9026,9236,9180,9427,8853,9594,9659,9040,9484,9291,9126,9081,9174,8843,8907,9336,9519,9151,9817,8874,9217,9352,9027,8826,10153,8958,9332,9791,8372,9698,9707,8993,9267,8911,9063,9041,8950,9779,9053,8899,9219,9128,8970,9172,9849,8606,9802,9183,8944,9218,9442,9250,9220,9388,9026,9482,9390,9374,8953,9509,8713,8898,9455,9214,8876,10058,9557,8723,9568,8461,9260,9275,9463,9203,9686,9448,8867,9518,9053,8691,9302,8242,10037,8977,9231,9173,9299,9027,8927,8561,9327,9419,9028,9712,9168,9470,8609,8945,8759,9067,9839,9107,9279,9331,8821,9384,8136,9695,9364,8972,9920,10039,9544,9254,8915,9555,9222,8579,9181,9414,8738,9227,9326,9246,8743,9242,8783,9639,9237,9195,9100,8898,9137,9381,8968,9170,9568,9778,9907,8595,9322,9416,9760,8081,9766,9034,8593,9039,8671,9054,9346,9500,9400,9344,9673,9363,9201,8818,9492,8728,9158,9259,9199,9887,9081,9551,9014,9187,9248,8837,9345,9293,8929,8761,9127,9397,8706,9339,9630,9294,9807,8929,8700,9031,8992,9117,8736,8612,9470,9418,9236,9246,9376,9469,8991,8952,8985,9111,9833,8964,9195,9630,9307,9289,9648,9119,9262,8832,9750,9068,8875,8852,9265,9174,9017,9459,9152,8562,9907,9141,8936,9577,9163,9336,8820,8900,9926,8953,9473,8424,9105,9519,8951,8944,9255,8356,8981,9577,8435,9971,8136,9017,9066,9419,8658,9480,8331,9178,9541,8733,9162,9399,9517,9429,8536,9442,8911,9276,8952,8689,9417,9583,9108,9594,9673,8851,9297,9635,9256,9170,9210,9638,9629,9497,9329,9499,8480,9591,8867,9203,9437,8808,8757,9220,8967,8841,9263,9021,9570,9244,8881,9313,9296,8953,8993,8787,9483,8882,9233,8966,8648,9083,8787,8991,9060,8530,9031,8301,9429,9425,9303,9339,9051,9466,9914,9108,8679,9786,9173,9429,9323,9085,8885,9002,9920,9301,9052,9236,9141,8465,9174,9184,9861,8801,9610,8624,9384,8706,9178,9435,9316,8806,9177,8840,9007,9193,8575,9678,8475,10034,8135,9126,10022,9063,9510,8777,8922,8686,9258,8705,9754,9863,8885,8637,8487,9691,8798,8399,9822,8938,9688,9216,9243,8802,9477,8856,9011,9589,8931,9549,8666,8868,9821,8945,8151,8536,8765,9737,8375,9591,8965,8628,8015,9325,8851,9623,9310,9011,8685,9887,8905,8407,9114,9212,8725,8921,9395,9264,8866,9776,9215,9203,9786,9533,9279,8972,9649,9303,9037,9162,8912,9652,9368,9106,9194,9310,9043,8595,8687,9261,8951,8922,9581,9487,9097,8963,9056,9404,9285,9383,9088,9254,8652,8853,9382,8317,8804,9737,9166,9403,8842,9590,8904,8789,8627,9792,9275,9439,9298,9258,9633,9571,9119,9331,8884,9120,9006,9239,9339,8852,9370,9289,8872,9459,9186,9455,8671,9732,8850,9413,8974,8922,8984,9563,8835,9283,8743,9370,9174,9033,8399,9489,9048,8622,9197,8981,8997,9154,9836,8875,8838,9384,8790,9010,9170,9526,8739,9428,9447,8650,9828,9150,8890,9028,8528,9527,9020,9416,9109,9109,9580,9110,8992,9331,8781,9731,9416,8667,9407,9009,8965,9126,9572,9598,8758,9644,8575,9732,8835,9423,9247,9297,8720,8610,8954,9231,9074,9328,8970,8551,9394,8696,9511,8630,8755,9226,8984,8695,9408,9148,8771,9357,9166,8331,8661,9479,9186,8924,9091,9194,8931,9027,8439,9427,9882,9063,10027,9006,9086,9826,9063,9618,9234,9585,9003,9596,9345,9853,9149,9406,8868,9215,9281,9587,9370,8866,10013,8697,9157,8574,9881,9127,10049,8957,9055,8758,9217,8279,9079,9265,8714,8562,9208,8453,9719,8151,8946,8698,9635,9070,8378,9888,9333,8605,9450,9267,8380,9195,9513,8642,9531,9498,9084,8547,8675,8992,8894,9770,8378,9609,9151,9211,9404,8604,9477,9488,9323,8722,9087,9099,8870,9086,9217,9252,9304,8943,9497,9033,8959,8973,9411,9475,8602,9075,9303,9709,9226,8833,9344,9246,9337,8585,8933,9363,8770,9114,9237,9098,8883,9448,9087,9594,9167,9559,8747,8934,9414,8768,9232,9032,9910,9137,8873,9416,9157,9221,8840,8775,9397,9211,9260,8747,8947,9737,9490,8664,8975,9079,9731,9312,8892,9466,9082,8664,9074,9246,9332,9081,8623,9652,9027,8909,8726,9755,8636,8984,8930,9409,10132,8411,9241,9273,9299,8753,9230,8797,8682,9590,9734,8935,8705,8990,9162,9344],"u8":[34,35,33,34,35,35,37,35,35,34,34,33,35,35,37,36,35,35,35,37,35,33,37,34,35,35,32,36,34,36,35,36,37,35,36,37,34,36,35,35,35,33,38,35,34,35,33,34,36,36,33,36,37,36,35,35,35,36,34,37,35,34,35,36,36,35,35,36,33,35,34,37,35,38,36,32,37,36,34,37,37,35,35,34,36,35,35,36,34,36,33,36,35,37,35,34,36,36,35,35,36,34,36,34,35,32,36,35,37,32,35,33,35,36,36,35,34,36,36,35,35,36,35,36,34,31,34,37,35,36,33,35,37,36,34,35,37,37,35,35,35,35,38,38,33,34,35,36,38,36,33,39,36,35,34,34,36,35,36,34,36,34,36,35,35,35,37,36,35,35,33,36,35,34,33,35,37,36,37,34,34,36,33,35,34,36,37,34,37,35,36,37,39,33,38,36,35,34,34,34,37,36,34,35,37,38,35,36,34,36,35,37,33,36,35,35,34,34,34,40,33,33,36,35,36,34,36,34,37,35,34,37,36,35,36,36,35,38,33,36,38,35,36,35,35,36,38,36,36,36,35,35,34,36,34,34,37,34,36,36,36,36,37,35,36,33,37,34,34,34,37,34,33,34,35,35,36,34,34,33,35,35,35,36,34,37,37,35,36,36,35,35,35,34,34,36,37,35,38,34,35,36,35,34,39,34,36,38,32,37,37,34,36,34,35,35,34,38,35,34,35,35,34,35,38,33,38,35,34,35,36,35,35,36,35,36,36,36,34,37,33,34,36,35,34,39,37,33,37,32,36,36,36,35,37,36,34,37,35,33,36,32,39,34,35,35,36,35,34,33,36,36,35,37,35,36,33,34,34,35,38,35,36,36,34,36,31,37,36,34,38,39,37,36,34,37,35,33,35,36,34,35,36,35,34,35,34,37,35,35,35,34,35,36,34,35,37,38,38,33,36,36,37,31,38,35,33,35,33,35,36,36,36,36,37,36,35,34,36,33,35,36,35,38,35,37,35,35,35,34,36,36,34,34,35,36,33,36,37,36,38,34,33,35,34,35,33,33,36,36,35,35,36,36,34,34,34,35,38,34,35,37,36,36,37,35,36,34,37,35,34,34,36,35,35,36,35,33,38,35,34,37,35,36,34,34,38,34,36,32,35,37,34,34,36,32,34,37,32,38,31,35,35,36,33,36,32,35,37,33,35,36,37,36,33,36,34,36,34,33,36,37,35,37,37,34,36,37,36,35,35,37,37,36,36,36,32,37,34,35,36,34,34,35,34,34,36,35,37,35,34,36,36,34,34,34,36,34,35,34,33,35,34,34,35,33,35,32,36,36,36,36,35,36,38,35,33,38,35,36,36,35,34,35,38,36,35,35,35,32,35,35,38,34,37,33,36,33,35,36,36,34,35,34,35,35,33,37,32,39,31,35,38,35,37,34,34,33,36,33,37,38,34,33,33,37,34,32,38,34,37,35,35,34,36,34,35,37,34,37,33,34,38,34,31,33,34,37,32,37,34,33,31,36,34,37,36,35,33,38,34,32,35,35,33,34,36,36,34,38,35,35,38,37,36,34,37,36,35,35,34,37,36,35,35,36,35,33,33,36,34,34,37,36,35,34,35,36,36,36,35,36,33,34,36,32,34,37,35,36,34,37,34,34,33,38,36,36,36,36,37,37,35,36,34,35,35,35,36,34,36,36,34,36,35,36,33,37,34,36,34,34,34,37,34,36,34,36,35,35,32,36,35,33,35,34,35,35,38,34,34,36,34,35,35,37,34,36,36,33,38,35,34,35,33,37,35,36,35,35,37,35,34,36,34,37,36,33,36,35,34,35,37,37,34,37,33,37,34,36,35,36,33,33,34,35,35,36,34,33,36,33,37,33,34,35,34,33,36,35,34,36,35,32,33,36,35,34,35,35,34,35,32,36,38,35,39,35,35,38,35,37,35,37,35,37,36,38,35,36,34,35,36,37,36,34,38,33,35,33,38,35,39,34,35,34,35,32,35,36,33,33,35,32,37,31,34,33,37,35,32,38,36,33,36,36,32,35,37,33,37,36,35,33,33,34,34,38,32,37,35,35,36,33,36,36,36,33,35,35,34,35,35,36,36,34,36,35,34,34,36,36,33,35,36,37,35,34,36,35,36,33,34,36,34,35,35,35,34,36,35,37,35,37,34,34,36,34,35,35,38,35,34,36,35,35,34,34,36,35,36,34,34,37,36,33,34,35,37,36,34,36,35,33,35,35,36,35,33,37,35,34,33,37,33,34,34,36,39,32,35,36,36,34,35,34,33,37,37,34,33,34,35,36]},"cell":{"ty":2,"tx":1,"u16":[40387,41247,43706,41450,39522,35431,32641,32252,32690,36596,38905,41356,42325,40459,38026,36836,34878,35529,36427,37247,35473,32175,29916,31226,27943,19148,17596,20320,25870,21517,23354,24989,41337,43028,44450,41673,38057,34542,32858,32141,35852,37173,40655,41655,42232,39363,37036,35935,35715,35950,37830,36821,35197,31588,30008,34063,23993,18671,18529,23361,23872,22546,25305,25580,42186,43860,42740,42529,37149,34053,32417,34436,36310,40429,42062,41243,40770,39055,37257,35994,37400,38008,38687,38968,33704,31691,31666,31461,21402,18814,20141,27275,23387,24151,25942,25970,45093,44708,44795,40904,37687,34290,34217,36211,38711,42493,44263,42502,41825,39254,37813,37836,39415,40289,39935,37607,34485,31491,34826,26049,20217,19426,22693,27087,23408,25259,26971,26771,46380,46595,45719,40714,38075,35467,36671,39018,42471,44419,46017,45336,41688,40954,38828,39615,42598,41755,40770,37698,32830,33074,33527,22999,20021,20840,26641,25478,24491,26567,27984,26717,46334,47571,46374,42768,39198,37643,38148,40881,46368,46611,47863,47048,44236,42327,42641,43188,42926,41882,39694,36791,33903,34674,28208,21559,20723,23775,30234,26090,26756,27910,27141,27114,46626,48861,46648,43507,41197,39641,41342,44212,47460,49654,50928,48434,47570,45847,45231,44493,44228,42434,39283,34749,32314,36203,24930,21473,23160,30195,28420,26692,28928,30263,28806,26655,45916,46799,47120,43778,42338,41136,43974,46734,48696,51120,52630,50437,48661,47087,46380,44189,41858,40174,35063,32649,32721,30582,23038,22690,28209,29435,27709,28677,30972,31240,28674,26377,43423,45838,46423,45081,43602,43949,46011,48031,50955,52216,52209,51099,49479,47981,43832,41469,37793,32629,32437,34468,35674,25331,22299,24815,29115,25795,28812,31605,32952,32133,29626,27104,41530,42850,43588,43605,43262,44243,46257,48691,51717,52411,51993,49958,46903,43777,39628,36728,33591,33145,38588,35884,26606,22511,21951,26241,26100,24305,27364,30745,31870,31313,29833,26643,39608,40102,42331,41681,41803,43258,44826,48113,49454,49962,47597,46201,41655,39158,35385,32991,34844,41286,32100,25917,22611,21310,21433,25201,25925,23530,26974,30175,31246,30223,28391,26588,38329,39017,38928,39310,39960,41626,43635,44925,44992,44740,42970,40985,38358,36060,36726,38887,33106,27905,24347,22474,21485,20787,20614,22370,29118,23619,25006,26591,27457,28005,27501,26103,37276,37984,37758,37733,37297,38718,39058,39399,40290,38260,39197,39459,41019,35708,31438,27992,25489,23756,22567,21722,21041,20512,20025,20192,22383,27533,26869,26264,25415,24979,24267,25194,37130,36668,37160,38396,37383,36399,36241,37251,38520,40796,41248,35462,31149,28344,26546,25215,24259,23797,23576,23470,23288,22945,22134,21098,20214,20513,22363,25547,25651,23197,22610,23926,39271,35160,33964,34135,35317,37143,37795,38892,37745,35102,32164,29926,28262,27375,27118,27486,28497,30475,32978,35415,37152,37578,35804,31606,25773,20891,18544,18666,21515,24231,21280,20993,40302,39697,36254,34831,34398,34164,33948,33487,32547,31441,30201,29228,29273,31499,36188,42097,48142,45250,43178,38972,35381,33346,31478,30196,31812,29455,20660,17212,17383,21530,21587,20713,41187,40941,41877,41319,39085,36760,34618,33059,32086,31119,30526,31216,36333,47652,50480,47015,44699,42967,40067,38773,38260,37269,34936,35478,32947,33442,29302,19229,16254,17688,23084,19850,42154,42330,43077,42865,42592,43251,40155,35431,32929,31773,32259,38130,52503,48518,49023,50822,50498,49992,47094,47684,45418,43536,44474,42375,38193,32749,32698,24993,16883,16037,20667,20258,42676,43901,45175,45485,45184,43939,46445,42505,35819,33349,36597,50487,45963,48158,52283,57443,58308,58933,55009,53983,53389,51995,50524,46437,41169,35274,31615,31532,19046,15528,18552,19968,42697,44055,47199,47869,49228,48003,46191,47023,43050,37241,43147,43797,45978,50198,56658,58664,60689,58306,57150,54950,55953,54969,55397,50205,46759,37990,33099,30349,21710,15674,17419,21036,43441,45796,47499,50696,50789,50567,48078,46254,45297,43926,42551,42078,45958,50983,52723,56960,57710,55907,52780,54340,53729,54423,54533,51503,48559,38523,33531,30636,22983,15716,16958,20928,44503,45198,48041,51958,53165,53306,49916,48193,44857,42575,41060,41965,44388,48656,50944,51596,51792,48543,47722,46687,48439,50381,50747,48535,43031,39521,32290,31354,21781,15482,17237,20787,39171,46215,47355,49586,52159,52633,52476,49227,46616,43071,42331,43032,44468,46435,45410,45581,43908,41273,39214,40334,40563,44184,45264,43593,40584,36020,31796,32620,19069,15342,18247,20760,38599,43260,46663,48454,51428,51772,50176,48521,45701,43489,41740,36926,38925,42943,45927,46488,42913,38210,34805,33256,34193,34109,35137,35826,35615,31435,31564,25924,16818,15943,20672,20161,45401,45237,46039,47439,48677,49339,48582,46752,44969,42660,42449,34967,31781,30758,29927,29031,28346,28596,32579,29422,28250,30089,29917,31025,32123,31402,30126,19474,16232,18104,22856,19385,46373,45558,45532,46025,46412,47115,46700,45365,43670,41375,40049,40031,33907,30281,27964,26341,25019,24481,26087,28195,27669,31058,34615,37294,35103,26862,20198,17182,18213,23552,20433,20495,49080,47495,45933,45513,44987,44779,44461,43434,41802,40993,39943,38150,39899,36923,32770,30219,28517,27300,26224,25876,26667,27356,26501,24095,21122,18789,17725,19310,24681,22483,21835,22489,50727,48883,46472,45392,44241,41196,43406,41780,41971,40792,39115,38281,36781,36575,36623,36525,35473,32948,29993,29658,24573,21757,20371,19264,18339,17943,19706,25927,22594,22009,22763,24094,52336,48664,47426,44579,43363,38908,38760,41584,39894,40836,40644,40185,38559,37154,36021,35187,33641,33354,31073,31452,31186,23419,20216,19042,18413,19064,24170,23912,22482,23991,26584,25692,52285,50114,48221,43707,42886,38918,36471,40450,40454,40672,41298,41140,40535,39262,38113,37599,38006,37374,33804,33073,36996,29925,22070,19503,18933,21061,29449,22238,23484,26344,27167,27011,51992,49210,47770,44318,41959,39216,35587,38010,39434,40210,41387,42135,41147,40900,40785,40375,40641,40938,39091,36385,33821,39142,26821,20608,19593,23219,25932,22036,25514,27737,28412,27020,50818,49555,47668,44008,41228,39441,35143,37208,38920,39640,40707,42603,41674,40400,40215,41831,43084,43708,43111,38578,34574,32508,34687,22805,20042,24252,23947,23902,26427,29008,28772,26307],"u8":[157,160,170,161,153,137,127,125,127,142,151,160,164,157,147,143,135,138,141,144,138,125,116,121,108,74,68,79,100,83,90,97,160,167,172,162,148,134,127,125,139,144,158,162,164,153,144,139,138,139,147,143,136,122,116,132,93,72,72,90,92,87,98,99,164,170,166,165,144,132,126,133,141,157,163,160,158,151,144,140,145,147,150,151,131,123,123,122,83,73,78,106,91,93,100,101,175,173,174,159,146,133,133,140,150,165,172,165,162,152,147,147,153,156,155,146,134,122,135,101,78,75,88,105,91,98,104,104,180,181,177,158,148,138,142,151,165,172,179,176,162,159,151,154,165,162,158,146,127,128,130,89,77,81,103,99,95,103,108,103,180,185,180,166,152,146,148,159,180,181,186,183,172,164,165,168,167,162,154,143,131,134,109,83,80,92,117,101,104,108,105,105,181,190,181,169,160,154,160,172,184,193,198,188,185,178,175,173,172,165,152,135,125,140,97,83,90,117,110,103,112,117,112,103,178,182,183,170,164,160,171,181,189,198,204,196,189,183,180,171,162,156,136,127,127,118,89,88,109,114,107,111,120,121,111,102,168,178,180,175,169,171,179,186,198,203,203,198,192,186,170,161,147,126,126,134,138,98,86,96,113,100,112,122,128,125,115,105,161,166,169,169,168,172,179,189,201,203,202,194,182,170,154,142,130,128,150,139,103,87,85,102,101,94,106,119,124,121,116,103,154,156,164,162,162,168,174,187,192,194,185,179,162,152,137,128,135,160,124,100,87,82,83,98,100,91,104,117,121,117,110,103,149,151,151,152,155,161,169,174,175,174,167,159,149,140,142,151,128,108,94,87,83,80,80,87,113,91,97,103,106,108,107,101,145,147,146,146,145,150,151,153,156,148,152,153,159,138,122,108,99,92,87,84,81,79,77,78,87,107,104,102,98,97,94,98,144,142,144,149,145,141,141,144,149,158,160,137,121,110,103,98,94,92,91,91,90,89,86,82,78,79,87,99,99,90,87,93,152,136,132,132,137,144,147,151,146,136,125,116,109,106,105,106,110,118,128,137,144,146,139,122,100,81,72,72,83,94,82,81,156,154,141,135,133,132,132,130,126,122,117,113,113,122,140,163,187,176,168,151,137,129,122,117,123,114,80,66,67,83,83,80,160,159,162,160,152,143,134,128,124,121,118,121,141,185,196,182,173,167,155,150,148,145,135,138,128,130,114,74,63,68,89,77,164,164,167,166,165,168,156,137,128,123,125,148,204,188,190,197,196,194,183,185,176,169,173,164,148,127,127,97,65,62,80,78,166,170,175,176,175,170,180,165,139,129,142,196,178,187,203,223,226,229,214,210,207,202,196,180,160,137,123,122,74,60,72,77,166,171,183,186,191,186,179,182,167,144,167,170,178,195,220,228,236,226,222,213,217,213,215,195,181,147,128,118,84,60,67,81,169,178,184,197,197,196,187,179,176,170,165,163,178,198,205,221,224,217,205,211,209,211,212,200,188,149,130,119,89,61,65,81,173,175,186,202,206,207,194,187,174,165,159,163,172,189,198,200,201,188,185,181,188,196,197,188,167,153,125,122,84,60,67,80,152,179,184,192,202,204,204,191,181,167,164,167,173,180,176,177,170,160,152,156,157,171,176,169,157,140,123,126,74,59,71,80,150,168,181,188,200,201,195,188,177,169,162,143,151,167,178,180,166,148,135,129,133,132,136,139,138,122,122,100,65,62,80,78,176,176,179,184,189,191,189,181,174,165,165,136,123,119,116,112,110,111,126,114,109,117,116,120,124,122,117,75,63,70,88,75,180,177,177,179,180,183,181,176,169,160,155,155,131,117,108,102,97,95,101,109,107,120,134,145,136,104,78,66,70,91,79,79,190,184,178,177,175,174,173,169,162,159,155,148,155,143,127,117,110,106,102,100,103,106,103,93,82,73,68,75,96,87,84,87,197,190,180,176,172,160,168,162,163,158,152,148,143,142,142,142,138,128,116,115,95,84,79,74,71,69,76,100,87,85,88,93,203,189,184,173,168,151,150,161,155,158,158,156,150,144,140,136,130,129,120,122,121,91,78,74,71,74,94,93,87,93,103,99,203,194,187,170,166,151,141,157,157,158,160,160,157,152,148,146,147,145,131,128,143,116,85,75,73,81,114,86,91,102,105,105,202,191,185,172,163,152,138,147,153,156,161,163,160,159,158,157,158,159,152,141,131,152,104,80,76,90,100,85,99,107,110,105,197,192,185,171,160,153,136,144,151,154,158,165,162,157,156,162,167,170,167,150,134,126,134,88,77,94,93,93,102,112,111,102]}};

  /* ---------- helpers ---------- */
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
    dek: 'On 30 synthetic test frames it never trained or was tuned on, a classical filter plus a residual U-Net lifts Otsu Dice from 0.081 to 0.943. The classical half alone reaches 0.566, and on 34 real cell frames it does most of the work. The network’s weights are not published yet.',

    chapters: [
      { id: 'problem', title: 'The problem',
        art: function (c) {
          return [0, 1, 2, 3].map(function (k) {
            return '<rect x="' + (30 + k * 14) + '" y="' + (20 + k * 14) + '" width="80" height="60" rx="4" fill="none" stroke="' + (k === 3 ? c.a : c.l) + '" stroke-width="1.3"/>';
          }).join('') + '<ellipse cx="100" cy="80" rx="12" ry="8" fill="none" stroke="' + c.i + '" stroke-width="1.3"/>';
        },
        blocks: [
          { p: 'Phase contrast is how you look at a living cell without staining it. The microscope turns tiny delays in the light into differences in brightness. It works, and it adds things that are not in the sample: a bright halo round every cell, a fade in the middle of large cells called shade-off, light that is uneven across the field, and sensor noise.' },
          { p: 'Segmentation usually starts with a threshold: brighter than this is cell, darker is background. The halo and the uneven light both push pixels across that line, and every count and area measured afterwards inherits the error.' },
          { p: 'I had no real micrographs with hand-drawn masks to train on, so I simulated them. `data/generate_synthetic.py` follows the imaging model of Yin, Kanade and Chen. The truth is f, the cells’ optical path difference. The microscope sees it through k, the phase ring’s blur.' },
          { tex: 'g = C - \\beta\\,(f - k * f)', caption: '`data/generate_synthetic.py`, after Yin, Kanade & Chen, *Medical Image Analysis* 2012. k is an apodised, obscured Airy pattern.' },
          { p: 'Both artifacts fall out of that one line. Just outside a cell f is 0 but k * f is not, so the background brightens: the halo. Inside a large flat cell k * f is close to f, so the cell fades: shade-off. Cells come out dark on grey, as in positive phase contrast. Then a camera: illumination that multiplies the image (a tilt and a vignette), Poisson-Gaussian noise, and a 16-bit PNG.' },
          { p: 'Each frame is 256 pixels with 6 to 15 cells. Seed 42 gives 100 frames, 80 to train and 20 to validate. Seed 1042 gives 30 test frames that nothing was trained or tuned on. The frames are generated, not committed; only the 20 validation frames ship, as the demo’s samples.' },
          { callout: 'The first version drew its halo as a difference of Gaussians, the same operation the classical path uses to remove it, so its scores were partly circular. The rebuild draws the halo from the optics instead. It is still a simulation, so I also checked it against real cells.', label: 'Why I rebuilt it' }
        ] },

      { id: 'built', title: 'What I built',
        blocks: [
          { h: 'A classical path' },
          { p: 'Five steps, all OpenCV, with no model:' },
          { list: [
            '**Polarity.** Invert, so cells are bright.',
            '**Flatten the background.** A grey-level opening with a 21-pixel square removes the cells and leaves the illumination. Smooth that and subtract it.',
            '**Suppress the halo.** Blur at σ 1 and σ 8 and subtract 1.5 times the difference.',
            '**CLAHE**, contrast-limited adaptive histogram equalisation, at clip 1.0 on an 8×8 grid, in 8-bit.',
            '**Normalise** so the 1st and 99.8th percentiles map to 0 and 1.'
          ], ordered: true },
          { tex: '\\text{enhanced} = x - \\alpha\\,(G_{\\sigma_1} * x - G_{\\sigma_2} * x), \\quad \\sigma_1 = 1,\\ \\sigma_2 = 8,\\ \\alpha = 1.5', caption: 'The halo step: `phase_cleanup/preprocessor.py:174–177` at the defaults in `configs/default_config.yaml`.' },
          { p: 'I tuned these defaults on the 20 validation frames, scoring the Otsu Dice of the classical output. The test frames played no part. A higher clip limit looks punchier and scores lower, so CLAHE is set mild.' },
          { h: 'A residual U-Net' },
          { p: 'Hybrid mode feeds that output to a U-Net: four levels, base width 32, GroupNorm, 7.76 million parameters. It trained on 128-pixel crops of the 80 training frames with L1 loss and AdamW, on a CPU. The best validation PSNR, 28.97 dB, came at epoch 94, and that is the checkpoint I report.' },
          { tex: '\\hat{y} = \\operatorname{clamp}\\big(x - f_\\theta(x),\\,0,\\,1\\big), \\qquad \\mathcal{L} = \\big\\lVert f_\\theta(x) - (x - y) \\big\\rVert_1', caption: 'Inference: `phase_cleanup/pipeline.py:196–197`. Loss: `phase_cleanup/trainer.py:130–133`. x is the classical output, y the truth.' },
          { p: 'It is not asked for the clean image. It is asked for what to remove, and the output is the input minus that. The argument is that a correction near zero cannot easily invent or erase structure the classical path kept. I tested that argument too, and it lost; see Results.' },
          { h: 'A browser port' },
          { p: 'The classical path is arithmetic, so `docs/cv.js` runs it in plain JavaScript, including OpenCV’s Gaussian kernels, reflected borders, the opening and CLAHE. On the 20 validation frames its output is bit-identical to Python’s at both CLAHE precisions. `scripts/verify_web_pipeline.py` and `scripts/check_controls.js` keep it that way in CI; the second fails if a slider stops moving the output.' },
          { p: 'The [live demo](https://akshayaa-403.github.io/phase-contrast-denoising/) runs the classical path in your browser. For its 20 samples the U-Net column is precomputed. Running the U-Net on your own image needs the model file from release v1.0.0, and that release does not exist yet, so the page hides the button.' }
        ] },

      { id: 'hard', title: 'The hard part',
        art: function (c) {
          var h = [30, 70, 52, 88, 40, 64, 22, 48];
          return h.map(function (v, i) {
            return '<rect x="' + (18 + i * 16) + '" y="' + (110 - v) + '" width="11" height="' + v + '" fill="' + c.p + '" stroke="' + c.i + '" stroke-width="1"/>';
          }).join('') + '<line x1="10" y1="104" x2="150" y2="104" stroke="' + c.a + '" stroke-width="2" stroke-dasharray="5 4"/>';
        },
        blocks: [
          { h: 'The slider that did nothing' },
          { p: 'CLAHE’s “contrast-limited” part is a ceiling: no grey level in a tile may hold more than a set number of pixels. Without it, a flat patch of background is stretched until its noise fills the whole range. The first version quantised to 16 bits before CLAHE, to keep precision. Its demo had a clip slider, and the slider changed nothing.' },
          { p: 'OpenCV turns the clip limit into a pixel count per grey level: clip × tile area ÷ number of levels, at least 1. Tiles here are 1,024 pixels. In 8-bit, clip 1 means a ceiling of 4. In 16-bit there are 65,536 levels, the sum is under one for any clip below 64, and the floor of 1 wins.' },
          { widget: 'ceiling', size: 'full', caption: 'One real 32×32 tile of img_0002 after background flattening and the DoG, quantised both ways by the repo’s current code. Bars are the tile’s count per grey level; the dashed line is the ceiling OpenCV computes for the clip on the slider. The small squares apply this tile’s own lookup table to itself, without blending between tiles, so they show the stretch, not the exact output. At clip {{clipv|1.0}}, 8-bit clips {{c8|—}} pixels and 16-bit clips {{c16|—}}.' },
          { p: 'I ran 16-bit CLAHE on img_0002 at clips from 0.5 to 40, and the output was bit-identical every time. In the flattest background tile, noise went from 0.0057 after the DoG to 0.19 after 16-bit CLAHE, more than thirty times as much. 8-bit at clip 1 gives 0.0117.' },
          { p: 'The rebuild runs CLAHE in 8-bit, and `check_controls.js` asserts that the 16-bit clip does nothing, so the cause is written down where a test reads it. On the 20 validation frames the classical path scores Dice 0.590 in 8-bit against 0.313 in 16-bit.' },
          { h: 'A filter that cannot see a ramp' },
          { p: 'Every difference of Gaussians has a gain of exactly 1 at zero frequency, so a slow brightness ramp goes straight through it. The first version had no other step. The rebuild flattens the background before the DoG, and the README credits that step with most of the classical path’s gain in Dice. I have not run the ablation that would say how much.' }
        ] },

      { id: 'results', title: 'Results',
        blocks: [
          { p: 'Three sets, with different jobs. The 30 test frames were never used for training or tuning, so they carry the headline. The 20 validation frames chose the checkpoint and the classical defaults, so they flatter the method a little. The 34 real frames test whether any of it transfers.' },
          { table: { head: ['Test set, 30 frames', 'PSNR (dB)', 'Otsu Dice'], rows: [
            ['Raw', '1.46', '0.081'],
            ['Best generic denoiser', '1.48', '0.081'],
            ['Classical path', '15.05', '0.566'],
            ['**Hybrid (shipped)**', '**28.65**', '**0.943**'],
            ['Plain U-Net (ablation)', '30.20', '0.953']
          ] }, caption: 'Means over 30 frames. 95% bootstrap intervals for hybrid: PSNR 27.98–29.27 dB, Dice 0.937–0.949. `README.md:26–32`.' },
          { p: 'Raw PSNR is near 1 dB because the raw background is grey and the truth’s is black. Fitted to the truth with a·x + b first, raw scores 17.5 dB, the classical path 18.8 and hybrid 29.7. Dice is the number I care about: does one global threshold find the cells?' },
          { p: 'Generic denoisers (Gaussian, median, non-local means) leave Dice at 0.081. Noise is not what breaks the threshold; the halo and the uneven light are. The classical path lifts Dice to 0.566 and the U-Net to 0.943.' },
          { widget: 'dots', size: 'wide', caption: 'The 20 validation frames, from the demo’s manifest. Each dot is one frame; lines join the same frame across the three paths, and img_0002 is ringed. Switch the metric. Hybrid beats raw on {{dwins|20 of 20}} frames.' },
          { p: 'On those 20, hybrid beats both raw and the classical path on every frame, for both metrics. Mean Dice goes from 0.083 to 0.952, and the worst hybrid frame, 0.916, sits far above the best raw one, 0.126. These frames picked the checkpoint, so they are not the headline.' },
          { h: 'The design I set out to test lost' },
          { p: 'The same network trained to output the clean image directly beat the residual version on the test set: 30.20 dB against 28.65, and Dice 0.953 against 0.943, with intervals that do not overlap. I kept the residual model as the shipped one because it is what the project set out to evaluate, and the ablation sits beside it in the README.' },
          { h: 'Real cells' },
          { p: 'On 34 frames of U373 cells from the Cell Tracking Challenge, scored against manual masks, the classical path lifts Dice from 0.10 to 0.61 as it is. The U-Net, trained only on simulated cells, adds nothing at native size (0.601) and a little once frames are rescaled to its cell size (0.634). It finds the cells but draws them as the smooth domes it was trained on. These numbers come from a local run; the report file behind them is not committed.' },
          { quote: 'The classical half transfers. The network learned my simulator.' },
          { p: 'On my laptop’s CPU, at 512 pixels, the classical path takes 16 ms a frame and hybrid 456 ms. I had no GPU, so GPU time is unmeasured.' }
        ] }
    ],

    closing: { blocks: [
      { list: [
        '**Publish the weights.** The README, the model card and the download script all point at release v1.0.0, and it does not exist. Until it does, nobody else can run hybrid mode, and the demo cannot run the U-Net on an upload.',
        '**Commit the real-cell report.** The U373 numbers are the most important result here, and the file behind them lives only on my machine.',
        '**Train on real images.** The network adds little to real cells because it only knows my simulated ones.',
        '**Take the ablation seriously.** The plain U-Net won. Either ship it, or find a case where predicting the residual earns its place.',
        '**Test that every control moves something, from the start.** The clip slider was dead for a whole version before I noticed.'
      ] }
    ] },

    sources: [
      ['Test set', 'README.md:26–32 and MODEL_CARD.md: 30 frames, seed 1042, means with 95% bootstrap intervals.'],
      ['Validation frames', 'docs/samples/manifest.json: the 20 seed-42 validation frames, per frame and mean.'],
      ['Real cells', 'README.md:50–63: 34 CTC PhC-C2DH-U373 frames, from a local run; results_real/report_real.md is not committed.'],
      ['Inert clip limit', 'phase_cleanup/preprocessor.py:179–204; cv2.createCLAHE on img_0002 after the DoG, clip 0.5–40, run with the repo’s code.'],
      ['Model and timing', 'MODEL_CARD.md (7.76 M parameters, best epoch 94, validation PSNR 28.97 dB); README.md:67–71 (16 ms and 456 ms at 512 px, CPU).']
    ],

    widgets: {
      /* ---------- where the ceiling is ---------- */
      ceiling: function (host, kit) {
        var tile = 'background', clip = 1;
        var top = kit.el('div', { class: 'k-row' });
        var pick = kit.choice({ label: 'Tile', value: 'background', options: [
          { value: 'background', label: 'Flattest background' }, { value: 'cell', label: 'Mostly cell' }],
          onChange: function (v) { tile = v; draw(); } });
        var sl = kit.slider({ label: 'clip limit', min: 0.5, max: 10, step: 0.5, value: 1, format: function (v) { return v.toFixed(1); },
          onInput: function (v) { clip = v; draw(true); } });
        top.appendChild(pick.el); top.appendChild(sl.el);
        host.appendChild(top);
        var panes = [8, 16].map(function (bits) {
          var hist = kit.el('div', { class: 'ph-ceil__hist' });
          var before = kit.el('canvas', { class: 'ph-ceil__tile', width: 32, height: 32, 'aria-hidden': 'true' });
          var after = kit.el('canvas', { class: 'ph-ceil__tile', width: 32, height: 32, 'aria-hidden': 'true' });
          var r1 = kit.readout('Ceiling', ''), r2 = kit.readout('Pixels clipped', '', 'k-readout--accent'), r3 = kit.readout('Tile std after', '');
          var el = kit.el('div', { class: 'ph-ceil__pane' },
            kit.el('h4', { class: 'ph-ceil__h', text: bits === 8 ? '8-bit · 256 levels (the default)' : '16-bit · 65,536 levels (first version)' }),
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

      /* ---------- twenty validation frames ---------- */
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
          var from = cur;
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
