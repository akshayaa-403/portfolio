/* Quantamental Screener — "Exhibit A: The Top Pick". A forensic long read:
   one old screenshot on trial, an evidence ledger in the margin.

   DATA PROVENANCE
   - ACN: approximate daily closes traced from
     public/assets/projects/quant-deepdive.webp (OLD code's deep-dive tab) by
     tools/quant-trace-acn.py, run once 2026-10-17; first day 2025-08-06,
     one value per calendar day. Read off a chart: about ±$1.
   - DARTS / WEEKS: trimmed from a re-run, on 2026-10-16, of the repo's HEAD
     (2e92f12) BacktestEngine with defaults over 2025-10-11 → 2026-10-11,
     universe = today's 50 largest (survivorship). DARTS = the 2000 random
     portfolios' compounded log returns ×1e4; the picks' is 5226.
     WEEKS = [rebalance date, picks, picks' period return ×1e4, median dart
     ×1e4, share of darts ≥ picks ×1e4].
   - ROWS: the ten rows of quantamental-screener/docs/screenshot-light.png
     (current code). */
(function () {
  'use strict';

  var ACN0 = '2025-08-06';
  var ACN = [246.5,241.6,239.3,239.1,238.7,238.4,239.1,245.6,246.5,246.9,247.9,248.5,250.3,255.5,254.7,255.0,258.7,257.9,257.1,256.3,255.5,257.1,256.8,259.8,259.0,257.9,257.1,255.8,254.2,253.2,254.7,255.5,255.5,254.9,251.0,243.9,242.9,239.0,238.3,238.3,237.5,237.7,240.9,239.8,239.8,239.8,239.8,239.5,236.3,238.0,233.9,239.1,241.8,244.7,246.9,246.2,243.8,244.6,245.3,246.2,247.5,248.9,251.3,252.4,250.0,241.0,242.2,242.7,243.5,243.2,239.0,235.0,238.2,239.8,240.7,243.3,249.8,249.3,249.3,247.7,248.8,249.9,251.4,252.7,248.2,249.3,250.0,249.4,249.3,247.6,244.2,246.5,242.3,245.7,245.3,245.1,244.3,243.3,246.7,247.3,245.3,243.8,242.5,241.3,240.6,240.6,241.9,251.0,248.9,246.0,244.5,248.9,248.5,249.1,250.3,253.0,255.4,257.9,262.5,271.6,269.2,266.9,266.5,266.5,267.2,269.6,272.0,270.5,271.4,272.8,273.8,274.4,272.4,273.6,270.4,272.0,271.7,271.2,270.8,270.6,270.4,270.4,271.2,271.2,271.2,271.1,270.1,267.7,263.6,260.3,261.7,262.6,265.5,275.1,275.1,281.2,280.8,280.6,280.6,280.3,278.3,288.1,287.5,285.9,282.5,279.4,275.9,273.9,280.8,284.1,281.4,280.9,280.6,280.1,275.4,269.4,262.0,263.5,264.9,265.9,263.6,242.3,240.6,235.1,240.3,239.2,238.3,237.2,239.1,230.1,222.6,224.2,223.1,222.0,220.8,220.3,222.3,215.8,214.6,210.5,205.6,201.0,195.8,193.2,207.3,208.5,207.6,206.9,206.5,209.8,210.6,213.9,214.7,213.1,211.4,208.5,202.1,201.0,197.0,196.7,197.5,198.3,199.1,198.1,196.6,202.4,200.2,199.8,199.8,199.5,193.9,192.6,195.4,193.2,194.2,195.9,197.4,198.3,197.5,201.0,200.6,199.8,199.7,198.8,197.0,193.5,186.6,180.6,184.0,188.0,191.5,190.8,193.6,194.2,197.4,196.7,195.9,195.1,194.0,189.2,178.8,178.4,177.9,177.9,177.9,178.0,179.8,178.7,179.6,180.2,180.2,180.2,178.7,175.2,179.9,180.0,177.6,175.1,172.3,168.6,161.1,164.5,168.9,171.8,174.7,176.9,177.1,178.7,177.9,179.4,178.7,177.9,177.4,177.0,176.5,179.2,186.9,190.3,193.5,195.5,186.8,178.2,178.7,178.1,177.1,175.6,174.4,173.2,170.4,167.8,170.0,168.7,166.9,165.3,164.7,153.5,128.9,126.9,126.1,125.3,124.9,126.7,128.5,126.2,128.4,127.7,126.0,124.5,125.2,131.0,136.9,137.1,137.1,137.1,137.6,141.3,137.5,138.5,135.7,136.3,137.7,137.9,135.1,137.4,143.9,143.8,144.2,144.2,144.3,141.2,140.2,139.5,146.4,149.1,151.5,154.8,164.8,171.5,164.5,165.7,166.1,165.7,166.5];
  var DARTS = [4483,3233,3880,3623,1864,4822,4723,4622,3618,3298,3702,2053,5312,4450,2981,4058,2900,2434,3183,4308,3620,5298,4244,3165,4669,4135,4423,2551,4259,3567,4435,6304,3898,3953,3382,3762,4735,5569,4050,3099,4412,4288,5612,3670,3396,2382,2221,3667,3626,3225,3008,4518,3332,4645,2186,3096,5042,3840,3134,3657,1972,3766,3572,5511,2854,3609,5517,3102,3840,3624,3848,3744,4225,3589,5192,4331,4501,2712,1205,3204,4594,3298,3643,3498,4941,2881,4222,3986,3772,3488,3315,3118,3018,4571,2321,3881,3966,4769,3149,6275,5868,4229,3709,4328,3549,2804,4162,4808,4932,3178,2527,5023,4383,2804,3816,3378,2834,3332,3533,5309,4692,3329,3260,3493,5461,3798,3945,3032,2684,2155,2394,3418,3110,4352,4988,3942,3128,3356,2372,2946,3508,1773,3816,3064,2760,1414,4285,2676,2875,3635,3776,4139,4026,1676,4459,4618,5204,2420,4537,658,2866,4756,3409,5384,1491,2464,3198,2776,5208,5318,5214,4994,2374,2651,3230,4135,4755,3659,5503,3329,2712,3573,3301,2529,2130,3063,2246,3658,4378,2345,3116,6235,1203,1948,4741,3289,3098,4632,5617,3941,4842,2308,3674,2210,4898,2600,2491,2160,3835,3651,1712,3305,2587,3014,3595,2372,3111,4125,3702,3373,5416,5152,5834,3924,2604,4450,2784,3055,2964,3326,2791,3188,4118,3115,3725,3849,3286,5072,3640,3034,2840,3124,4880,3713,3320,4936,4672,2900,4926,5375,3228,5981,3925,4703,4007,4952,1247,2825,2316,3861,3668,3330,2385,5656,3877,5099,2484,2870,3255,4235,3583,2858,4272,3346,4154,5169,3719,3071,5061,4292,3197,2785,4354,3682,2611,1731,3126,2563,5031,3460,4148,4181,2156,3460,2946,2111,3683,3097,3457,5587,2578,4151,3567,4209,4337,3625,3222,2001,3102,4678,4976,3226,3981,4116,4313,4997,2918,2903,4904,3514,5694,5056,2887,2519,3043,3443,4527,3137,4106,3867,2490,4916,5760,3198,1952,1323,3458,3878,1873,3455,4649,4679,3339,3205,3445,6103,3668,2234,3843,3676,4044,3844,4251,3935,5155,4211,3690,4822,2947,4188,3456,3388,3203,3122,3912,1577,3401,2123,5858,4681,2719,3785,3553,2193,2613,4215,4703,3777,2817,3787,4773,2836,4125,3362,4599,5566,3188,4712,2672,3927,3463,3974,2798,4836,3213,3351,4836,3442,2975,3511,1442,5391,2929,3733,3433,1774,1574,2619,2928,3150,4090,2563,1834,4775,3998,5099,3443,2745,3228,4816,387,3362,4067,4959,3955,5731,3012,4662,3087,3498,5682,4465,2814,733,3756,4251,4541,3979,2283,2485,2567,4130,3696,4398,400,3886,4388,3814,3241,4778,3443,1860,3780,3166,3539,2166,2963,2573,2040,4043,2858,4712,4100,4936,2329,3489,3047,2915,1402,4195,4339,2780,3411,4120,5026,4046,1801,2282,2776,2472,5653,2436,4027,3575,2763,5890,2957,3603,2648,3624,4557,2911,4719,4080,3740,5348,4294,3471,2979,3135,4313,1520,3261,4909,3687,3534,3780,2468,497,3761,647,4273,4958,844,3128,2183,3631,2869,3063,4282,2591,1908,3381,4958,2281,1930,3923,4720,3094,3280,4399,1878,2793,4125,3726,3886,3627,4750,3793,4580,4070,1976,4500,4341,4651,3605,3420,1195,4197,2253,2703,1602,4524,3499,229,5076,3220,3766,2231,3879,3481,2176,3355,4131,3008,2830,6001,2613,4451,3741,3238,4190,3537,2172,4811,3673,3084,3211,1839,3676,3384,4334,4939,2959,6202,1918,4422,3572,2413,5180,2636,3828,4514,4737,3741,4544,4909,5631,6819,2580,5411,4415,4196,4023,2467,4529,2963,5093,3117,4295,3712,4265,3827,5510,2432,4096,2067,2606,4021,3567,4317,3817,4462,2338,4924,2625,4523,4208,2790,4899,5046,3063,4834,3777,3144,3193,2991,2783,3059,2001,5297,4610,3280,4292,1647,4239,5008,4153,1707,2915,2490,4861,3352,5683,2257,6025,1161,5960,3814,2710,3017,1606,4303,3511,3296,1945,2352,3127,4250,2982,2875,2061,4054,4058,2223,3849,5313,2581,2796,5119,1089,2621,2652,3303,4880,3883,3267,4509,5343,4971,4462,2261,3775,3978,5089,3054,3104,2766,3455,2916,4301,4742,3104,1827,3108,5217,4787,4640,4322,1710,5591,3513,3282,3326,4184,4432,3155,4509,5900,4260,3003,5097,4446,2052,3502,3376,4357,3228,3111,1939,4856,3170,3361,3182,2610,1493,3857,3984,1158,3950,5670,3082,3758,4949,3241,2980,5164,6158,4277,3407,3438,4778,3244,4741,3964,2069,1725,2192,4224,4634,3011,4050,4704,1816,4742,3697,4952,3400,3889,2902,5085,1007,4495,4302,4654,4130,5149,3200,4056,2531,5290,3033,2155,4021,4936,5230,2946,5364,5331,2497,3019,3737,3740,4971,4139,2935,2702,4632,4368,2754,4432,2482,3594,3326,3904,5132,1583,2003,2443,3208,2090,3468,2262,4011,4276,4286,3909,3686,3883,1934,5002,4292,3736,4422,3911,3037,2624,4506,3725,3632,3235,4079,2470,4014,4287,4459,4579,1987,4293,4334,4018,3033,3752,5254,2572,4071,1094,3903,6162,3202,3990,2416,2074,4167,3401,6274,1950,6094,4495,4410,3880,4310,4808,4668,5175,3662,3901,2883,5045,4564,4042,4921,4423,2753,2945,3774,5214,4746,2760,2859,2079,3088,3519,3104,2039,2861,2767,4422,4399,2731,2040,2751,2642,4546,3792,2347,3963,4436,4507,2528,2772,3254,1388,3101,3521,3969,3281,3301,3658,2213,4438,4339,5206,5013,5118,5706,3501,3419,3669,2571,3285,4753,3960,2968,4198,2579,5568,4712,4897,4795,4715,4401,4242,4823,4436,3462,4563,2661,5315,3536,4925,2801,3611,4589,6223,4723,2731,2811,1044,4191,4955,4574,3411,2713,4409,2485,2977,3314,641,5463,3248,1966,3999,4696,3306,4051,4430,2532,3744,3052,4848,3164,4110,3431,2090,4873,1862,5474,4881,2357,5697,3582,3415,3821,3859,5206,3939,4398,5234,3659,4131,4327,1715,4225,4321,7044,2458,4123,3642,4861,3490,4473,4136,3882,4888,3232,2947,4272,2314,4809,5433,4416,3637,3650,2552,3105,2679,3959,4413,4612,4296,5079,4026,3770,4178,3666,5035,4923,4113,4906,1885,1697,4622,4447,3801,4325,3301,4561,4377,5972,3060,3841,3603,3110,3561,3818,5803,4875,3724,4625,3068,2193,5038,4018,2720,3320,2801,4462,2902,4395,3211,4731,3300,3321,3555,5063,3170,6101,4631,3426,1764,3425,4405,2925,2072,4520,4537,3314,4279,2054,3435,3618,2189,2045,2260,4978,2128,3268,2758,4691,4619,4840,3020,2924,2817,3365,5458,3759,4059,1090,3775,1946,4423,6277,3342,4129,3783,3719,2292,3979,5247,2637,3407,5577,2727,1829,3671,2462,2931,2286,3494,5092,5591,3925,3600,3381,3851,1789,3114,3746,3049,3251,3252,3248,4636,4645,5196,4465,4007,2626,2994,5636,2970,5061,2920,3643,3859,4734,2763,2550,1775,2756,4640,3843,3454,2806,5002,4092,3676,3032,3440,3354,3546,4656,3377,3904,5240,1685,4366,4608,2944,4740,2433,2244,2813,3647,3338,4307,3126,4421,3488,2761,4256,3713,3863,4325,3096,3036,4480,4053,6440,2695,2886,4047,3691,2643,3891,4485,1973,4224,2309,2860,3294,3924,4173,3570,2976,2522,2793,2613,2694,3103,3578,6500,3634,3851,3722,5727,4637,2181,4573,4622,4466,4979,4263,3251,2585,3202,2577,4277,3753,4333,2670,1263,5521,6376,3300,4534,4868,4063,4189,4776,4010,5364,3519,2757,2884,4119,3716,3652,3999,2719,5413,4143,2971,3840,4218,4868,3902,4774,4268,3421,3234,2395,3748,2641,4280,3447,2754,3248,3647,4752,3914,3625,2925,2940,2633,4835,5581,3794,4246,3653,3531,3892,4270,3928,2689,3202,4015,2564,3202,3808,2859,4062,3475,5129,3356,3257,5275,3294,4180,3411,1755,3520,4969,3274,1907,2964,4517,5069,4985,3902,4528,4470,3996,3880,2914,4043,2639,2790,3482,3469,4081,2494,5024,3207,3861,3234,3086,5043,4916,1120,3149,2785,4071,2909,2803,2860,3991,3715,4093,3885,4890,3025,3440,2722,2428,2544,4847,3079,3467,3374,4548,2651,3296,2628,3998,3364,3282,5576,5221,3945,4156,4181,5292,3991,3187,3679,3674,2440,1764,2033,5254,4116,3308,2818,5284,3098,3078,4778,3879,1979,4759,5319,4059,2850,3426,2878,4088,2049,4161,3201,3598,2249,2143,2201,2680,2723,4697,3596,3615,3202,3600,3153,3478,1535,4004,2768,4276,2828,4402,3471,3747,4046,3157,4064,2573,3562,2561,5247,3994,3084,3373,3583,3816,3209,4695,5436,5062,4278,3239,2907,3765,3177,3352,4621,2220,5952,2915,5193,2205,4418,4556,4330,3355,4711,3934,1184,3251,3014,1542,2240,2703,4366,3751,4899,5107,2230,3840,3231,3350,4146,2221,3263,4587,2768,3871,3545,4600,5788,3181,3564,2501,2235,2652,2957,1216,3243,2477,4428,2806,4124,3258,2048,2957,3041,5934,2200,4258,5161,3524,3245,3436,3238,4055,3187,3575,5343,2837,2894,2953,4726,4879,4070,5147,5462,3682,3681,5210,2350,3297,3403,3681,2392,3886,5228,4291,4013,4126,3594,3681,3362,2737,1937,3763,3641,2533,3021,2723,2354,1651,4615,4344,5015,3759,2926,3408,2668,3569,2641,5230,3711,4627,3257,3943,1680,3635,3062,4785,2432,3558,5461,4122,1320,3734,2892,4553,3576,3365,3917,3214,4104,4734,1946,3301,4023,5434,4282,3788,4292,3462,3546,3660,4980,2589,4298,4526,3357,4719,4108,3725,3392,4502,3795,3564,2191,3615,4951,3916,3189,4933,3456,3708,4271,5328,2034,2379,3206,3894,5436,3895,1805,2036,2068,2642,3796,3371,2077,3722,4101,3081,3100,4272,5491,1969,3700,2512,3256,4221,4896,3999,6024,2252,3736,2826,3179,2215,2535,3768,2978,3615,4819,3648,2169,3535,5506,2629,2485,4332,5264,3531,5010,1284,1616,6161,3769,5112,3030,4649,2596,2475,3751,2597,2976,3135,2905,3416,4608,3495,2496,1898,2439,3535,3640,3883,3133,5361,4446,4092,2460,5249,4888,2944,3988,1906,4795,3153,2336,3406,3677,5465,4039,3429,1941,6129,3280,2908,3474,4538,4131,3199,2457,3486,1539,3538,3522,3628,3314,2124,3938,4467,4379,3902,3276,3193,3774,2425,3752,1932,5316,3878,3176,4276,3673,4172,4087,2928,5359,2867,2619,2447,3942,2994,3101,4623,4906,2713,3397,3530,3172,1999,3396,3643,3280,2766,3195,4574,4012,4482,1947,3372,3845,2852,5072,4080,3949,3182,3601,3841,3182,3478,3072,3764,5557,1670,4361,5967,4480,3199,5230,3284,3668,1043,3206,1719,1939,4853,3129,4449,2795,3232,3701,4124,4848,5832,4087,4536,3486,5420,4266,2813,4144,4539,2779,1921,1786,4786,3058,2944,4080,4539,3308,3447,5090,3652,4073,3587,3338,3626,3232,4484,3976,5041,3601,1769,4222,3286,5212,3424,4532,3109,5106,2950,2435,4074,3305,3031,3517,4510,3990,4249,2958,4751,3766,4594,3986,5269,4270,1839,3381,2971,5281,3736,1953,2948,4436,2394,4020,4107,3378,3969,4136,5018,2875,2109,3267,3826,3858,4737,4442,1974,3156,3012,4624,3067,3704,3544,3722,5070,2354,1955,4150,3039,3315,1816,4854,3152,4429,3664,5100,2362,2854,4870,2122,3728,4173,3153,4068,2169,3105,4351,5096,2701,3888,4013,4260,3113,5007,3644,2577,5260,2606,3201,2508,2131,4667,3542,2802,5167,4485,2886,1664,2910,1708,3130,3386,3338,4188,3072,1113,3340,3446,5433,3957,5165,4224,6132,4589,5578,3261,4541,4450,2799,4180,2236,4285,4176,4380,3121,1915,2290,3543,2826,2799,3773,2990,2964,5417,4430,2875,5733,4268,4758,4418,4660,4509,1549,2864,4518,5070,2506,3188,4492,2538,4596,3317,4125,3249,2812,3083,3509,4669,4688,3131,6362,4220,3051,3989,1899,3302,2528,2824,2838,3461,2691,3522,2796,4665,4405,5506,3489,4235,3047,6251,4916,4864,5151,5552,3589,3883,3022,5629,3796,4967,2263,3073,5839,3245,3256,1570];
  var PICKS_LOG = 5226;
  var WEEKS = [
  ["2025-10-13", "AVGO GE GEV JPM KO MS ORCL PLTR PM WMT", -72, 169, 9915],
  ["2025-10-20", "BAC CRWD GE GEV GOOG GOOGL NFLX PLTR PM TSLA", 94, 187, 7890],
  ["2025-10-27", "AVGO CRWD GEV GOOG GOOGL GS INTC JPM LRCX PLTR", 277, -19, 210],
  ["2025-11-03", "AMZN CRWD CSCO GEV JPM LRCX NFLX ORCL PLTR TSLA", -153, 30, 9530],
  ["2025-11-10", "AVGO CRWD CSCO GE GEV INTC JPM NFLX NVDA PLTR", -400, -232, 9005],
  ["2025-11-17", "ABBV AVGO CRWD GE GEV JNJ LRCX MU ORCL PLTR", -138, 8, 8655],
  ["2025-11-24", "ABBV AVGO GE GOOG GOOGL INTC JNJ LRCX MU PLTR", 346, 248, 2440],
  ["2025-12-02", "AAPL AMAT AMD AVGO GE LRCX MU NFLX NVDA PLTR", 129, 23, 1850],
  ["2025-12-09", "AMD AVGO CRWD GE GS LRCX MS MU PLTR RTX", -251, -7, 9475],
  ["2025-12-16", "ABBV AMD CSCO GE GS JNJ LRCX MU PLTR RTX", 449, 141, 30],
  ["2025-12-23", "AMD CAT GE GEV GOOGL JNJ LRCX MU PLTR RTX", -139, -73, 8640],
  ["2025-12-31", "AVGO GE GOOG GOOGL INTC LLY LRCX MU PLTR PM", 489, 202, 250],
  ["2026-01-08", "ABBV CRWD GOOG GOOGL INTC JNJ LLY LRCX MU PLTR", 300, 143, 1520],
  ["2026-01-15", "AMD CAT GE INTC JNJ LRCX MU PLTR PM RTX", 94, -11, 2400],
  ["2026-01-23", "AMD GOOG GOOGL GS INTC JNJ LLY LRCX MU PLTR", 3, 77, 6760],
  ["2026-01-30", "CAT GE GEV GOOG GOOGL LRCX MU NVDA PLTR RTX", -40, 70, 7190],
  ["2026-02-06", "ABBV AMAT AVGO CAT GEV JNJ LRCX MRK MU PM", 307, -65, 50],
  ["2026-02-13", "ABBV GEV GOOG GOOGL INTC JNJ KO LRCX MU RTX", 96, -79, 915],
  ["2026-02-23", "AMAT AMD CAT GE GOOG GOOGL GS LRCX MU RTX", -57, 155, 9520],
  ["2026-03-02", "AMD GE GEV GOOG GOOGL INTC JNJ LRCX MU RTX", -287, -149, 8715],
  ["2026-03-09", "CVX GEV GOOGL INTC JNJ LRCX MU PLTR RTX XOM", 224, -59, 25],
  ["2026-03-16", "AMAT CAT CSCO GEV INTC JPM LRCX MU RTX XOM", 38, -126, 790],
  ["2026-03-23", "AMAT CAT CVX GEV GOOGL GS LRCX MS MU XOM", -645, -350, 9685],
  ["2026-03-30", "AMAT CAT GEV JNJ KO LRCX MRK MU WMT XOM", 528, 528, 5005],
  ["2026-04-07", "AMAT AMD CAT GE GEV GOOG GOOGL INTC LRCX MU", 1382, 520, 5],
  ["2026-04-14", "AMD AVGO CAT DELL GEV GOOG GOOGL INTC LRCX MU", 289, 128, 1885],
  ["2026-04-21", "AMAT BAC CAT GEV GS JPM LRCX MU NVDA WMT", 212, 141, 3600],
  ["2026-04-28", "AMAT CAT GOOG GOOGL GS INTC LRCX MS MU NVDA", 960, 298, 20],
  ["2026-05-05", "AMAT CAT CVX DELL GEV LRCX MRK MU NVDA XOM", 442, 324, 2730],
  ["2026-05-12", "AMAT AMD CAT CSCO GEV GS INTC LRCX MU RTX", -351, 10, 9995],
  ["2026-05-19", "GOOGL INTC JNJ LRCX MRK MS MU RTX WMT XOM", 534, 337, 2425],
  ["2026-05-27", "AMAT AMD AVGO CAT GEV GOOG GOOGL INTC LRCX MU", 309, 174, 2980],
  ["2026-06-03", "AMAT AMD AVGO CAT GEV INTC LRCX MS MU TXN", -960, -247, 10000],
  ["2026-06-10", "AMAT AMD GOOG GOOGL INTC JNJ JPM LRCX MU UNH", 883, 333, 55],
  ["2026-06-17", "AAPL AMD CAT GEV GOOG GOOGL INTC LRCX MU XOM", 311, 29, 545],
  ["2026-06-25", "AMAT AMD AMZN CAT GEV INTC JNJ LRCX MRK MU", -428, 206, 9975],
  ["2026-07-02", "AMD DELL GOOG GOOGL INTC JNJ JPM META MS MU", 261, 21, 595],
  ["2026-07-10", "AMAT AMD CSCO DELL INTC JPM LRCX MS MU UNH", -785, -159, 10000],
  ["2026-07-17", "AAPL AMD DELL INTC JNJ LLY LRCX MRK MU UNH", 257, -47, 150],
  ["2026-07-24", "AMAT AMGN CAT GEV INTC LRCX MU RTX TMO XOM", -293, 25, 9790],
  ["2026-07-31", "AMAT AMD AMZN CAT CSCO DELL INTC LRCX MSFT MU", 619, 380, 1725],
  ["2026-08-07", "AAPL AMD BRK-B INTC LLY LRCX MRK MU RTX XOM", 293, 84, 380],
  ["2026-08-14", "AMD CRWD DELL GOOG INTC LRCX MRK MS MU PANW", -441, -156, 9765],
  ["2026-08-21", "AMAT AMD CVX DELL INTC LRCX MU PM TMO XOM", -186, 8, 9840],
  ["2026-08-28", "AMAT AMD CRWD DELL INTC LRCX MS MU NVDA PANW", 284, 33, 225],
  ["2026-09-04", "AMAT AMD CAT DELL GOOG GOOGL INTC LRCX MU UNH", -204, -87, 8060],
  ["2026-09-14", "AMAT AMD CAT CSCO DELL GOOG GOOGL INTC LRCX MU", 992, 231, 0],
  ["2026-09-21", "AMAT AMD AMGN CAT DELL INTC LLY LRCX MU TXN", 97, -61, 615],
  ["2026-09-28", "AMAT AMD CAT COST DELL JNJ LLY LRCX MRK MU", 147, 86, 2950],
  ["2026-10-05", "AMAT AMD CAT CSCO DELL LRCX MRK MS MU XOM", -86, 109, 9590]
];
  var ROWS = [
    ['DELL', 2.398, 0.000, 0.451, -1.298], ['MU', 3.000, 0.152, -1.697, -1.185],
    ['MRVL', 1.461, 0.000, 0.502, -1.431], ['BRK-B', -0.591, 1.640, 0.704, 1.270],
    ['MRK', 0.403, 0.000, 0.741, 0.566], ['WMT', -0.560, 1.113, 0.158, 0.547],
    ['WFC', -0.404, 0.000, 1.569, 0.366], ['CAT', 0.266, 0.000, 0.471, -0.183],
    ['JNJ', 0.008, -0.145, 0.599, 1.006], ['UNH', -0.511, 0.000, 1.514, 0.772]
  ];
  var FACT = [['mom', 'Momentum', 'M'], ['sent', 'Sentiment', 'S'], ['vol', 'Volume', 'V'], ['vty', 'Volatility', 'σ']];

  /* The five headlines on the old deep-dive tab, tokenised. v = VADER
     lexicon valence (after negation), miss = a word a reader would call
     negative that VADER's lexicon lacks. tb = TextBlob polarity. */
  var HEADS = [
    { w: [['Accenture'], ['(ACN)'], ['Faces'], ['Growth', 1.6, 'growth'], ['Concerns', 0, 'missing', 1]], tb: 0 },
    { w: [['Here’s'], ['Why'], ['Accenture'], ['(ACN)'], ['is'], ['Struggling', -1.8, 'struggling']], tb: 0 },
    { w: [['Is'], ['Accenture'], ['(ACN)'], ['Facing'], ['Challenges', 0.3, 'challenges'], ['Due'], ['to'], ['Structural'], ['Factors?']], tb: -0.125 },
    { w: [['ACN:'], ['Priced'], ['Like', 1.5, 'like'], ['A'], ['Decline,', 0, 'missing', 1], ['Paying'], ['Like', 1.5, 'like'], ['A'], ['Machine']], tb: 0 },
    { w: [['ACN'], ['Got'], ['Cheaper.', 0, 'missing', 1], ['The'], ['Business'], ['Did'], ['Not'], ['Get'], ['Worse', 1.554, 'worse', 0, '−2.1 × −0.74']], tb: -0.4 }
  ];

  function compound(x) { return x / Math.sqrt(x * x + 15); }
  function mean(a) { return a.reduce(function (s, x) { return s + x; }, 0) / a.length; }
  function pstd(a) { var m = mean(a); return Math.sqrt(mean(a.map(function (x) { return (x - m) * (x - m); }))); }
  function sgn(n, d) { return (n >= 0 ? '+' : '−') + Math.abs(n).toFixed(d); }
  function pct(n, d) { return sgn(n * 100, d == null ? 1 : d) + '%'; }
  function svgStr(s) { return s; }

  Article.register('quantamental-screener', {
    form: 'forensic',
    scramble: '0123456789.+−%σΣ$',
    rail: 'ledger',
    dek: 'In an old screenshot of my stock screener, the top pick is Accenture: composite 0.983, strong momentum, good news. One tab over, its price is down about 40% from January and the headlines say it is struggling. This is a cross-examination of that one number, and of what I changed because of it.',

    opener: function (c) {
      var bars = [3, 6, 11, 17, 22, 25, 21, 15, 9, 5, 3, 1], s = '';
      bars.forEach(function (h, i) {
        s += '<rect x="' + (14 + i * 8.5) + '" y="' + (100 - h * 3) + '" width="6.5" height="' + h * 3 + '" fill="' + (i >= 9 ? c.a : c.l) + '"/>';
      });
      return s + '<line x1="10" y1="100" x2="118" y2="100" stroke="' + c.i + '" stroke-width="1.2"/>' +
        '<line x1="92" y1="18" x2="92" y2="104" stroke="' + c.a + '" stroke-width="2"/>' +
        '<line x1="30" y1="30" x2="30" y2="104" stroke="' + c.i + '" stroke-width="1" stroke-dasharray="3 3"/>' +
        '<circle cx="92" cy="18" r="4" fill="none" stroke="' + c.a + '" stroke-width="1.6"/>';
    },

    chapters: [
      { id: 'top-pick', label: 'Exhibit I', title: 'The top pick',
        art: function (c) {
          return '<rect x="30" y="20" width="100" height="80" rx="6" fill="none" stroke="' + c.l + '" stroke-width="1.5"/>' +
            '<circle cx="46" cy="36" r="5" fill="none" stroke="' + c.a + '" stroke-width="1.5"/>' +
            '<text x="80" y="76" text-anchor="middle" font-family="serif" font-size="34" fill="' + c.i + '">A</text>';
        },
        blocks: [
          { p: 'This is a screenshot I used on this site for months. It is the dashboard of Quantamental Screener, a Python app I built that ranks large US stocks on four signals at once: momentum, trading volume, volatility and the tone of recent news. Each name gets a z-score per signal, the four are weighted and summed, and the list is sorted.' },
          { figure: 'public/assets/projects/quant-dashboard.webp', size: 'wide',
            alt: 'Old dashboard, Top Stocks tab: 50 stocks analysed, average composite 0.667, top pick ACN at composite 0.983 with momentum 2.440, sentiment 0.883, volume −0.749, volatility −1.078.',
            caption: 'Exhibit A. The OLD code (before 12 October 2026). ACN first at 0.983. GOOGL’s sentiment reads exactly 3.000, the clip.' },
          { p: 'The top pick is ACN, Accenture. Composite 0.983. Momentum 2.440, more than two standard deviations above the other names that day. Sentiment 0.883, also well above average. My caption under it used to say the two were agreeing, which is exactly the condition the model is built to surface.',
            notes: [['which is exactly the condition the model is built to surface', 'I wrote that. It was wrong twice over.']] },
          { p: 'Then I opened the Stock Deep Dive tab for the same run.' },
          { figure: 'public/assets/projects/quant-deepdive.webp',
            alt: 'Old deep-dive tab for ACN: composite 0.983, momentum 2.440, sentiment 0.883, sentiment confidence 72%, a price chart falling from about $285 in January to about $125 in late June, and five headlines including “Here’s Why Accenture (ACN) is Struggling”.',
            caption: 'Exhibit A, page two. Same OLD run. The price history and the five headlines its sentiment came from.' },
          { p: 'ACN’s own chart peaks near $288 in mid-January and bottoms near $125 at the end of June. It ends around $167, about 40% below the high.^[Read off the chart with tools/quant-trace-acn.py: approximate, to about a dollar.] Under it are the five headlines the sentiment was computed from. Two of them say “Growth Concerns” and “Struggling”.' },
          { quote: 'How did a machine built to find strong, well-liked stocks crown this one?' },
          { p: 'Each exhibit below takes one number off that screenshot, finds the code that produced it, and enters a verdict in the evidence ledger. Every screenshot of the old app on this page shows code from before 12 October 2026, when I rewrote most of the screener. I say which code each number came from.' }
        ] },

      { id: 'dictionary', label: 'Exhibit II', title: 'What the dictionary read',
        art: function (c) {
          var s = '';
          [0, 1, 2].forEach(function (i) {
            var y = 30 + i * 30;
            s += '<line x1="20" y1="' + y + '" x2="140" y2="' + y + '" stroke="' + c.l + '" stroke-width="6" stroke-linecap="round"/>' +
              '<line x1="' + (50 + i * 30) + '" y1="' + (y - 12) + '" x2="' + (50 + i * 30) + '" y2="' + (y - 5) + '" stroke="' + c.a + '" stroke-width="2"/>';
          });
          return s;
        },
        blocks: [
          { p: 'The sentiment comes from two off-the-shelf scorers, VADER and TextBlob. Neither reads the way a person does. VADER looks each word up in a dictionary of about 7,500 entries, adds up the ones it knows, flips a word that follows a “not”, and squashes the total into −1 to +1 with `x / √(x² + 15)`. TextBlob averages its own polarity scores for the words it knows. My code averages each model over the headlines and blends them, 0.6 VADER and 0.4 TextBlob.' },
          { widget: 'strips', size: 'wide',
            caption: 'The five real headlines from Exhibit A, scored with the repo’s own VADER 3.3.2 lexicon and TextBlob 0.20 (re-run 2026-10-16). Underlined words are in VADER’s lexicon, with their valence; struck words are not. Select a headline to place it on VADER’s curve. The slider is hypothetical: the valence is yours, not VADER’s.' },
          { p: 'In “Faces Growth Concerns”, VADER knows [[growth|growth]] (+1.6) and has never heard of [[concerns|missing]]. In “Priced Like A Decline, Paying Like A Machine” it counts [[like|like]] twice, +1.5 each, as if it were a feeling. “Did Not Get [[Worse|worse]]” is the one it gets right: −2.1, flipped by the “not” to +1.55.' },
          { p: 'TextBlob scores three of the five at exactly 0. Its only opinions are −0.125, from the word “due”, and −0.4 from “worse”, which it does not see negated.' },
          { p: 'Averaged, VADER says +0.2045 and TextBlob −0.105. Blended, that is +0.0807, with a confidence of 72.42%. The dashboard showed “Sentiment confidence 72%”. I recomputed it from the five headlines with the repo’s own library versions, and it matches.^[scratchpad sent.py, run 2026-10-16 in the repo’s venv; confidence = 1 − std of the per-headline scores, blended 0.6/0.4 (ensemble_sentiment.py:46-47).] So this number is not a bug. It is what the method does. Against the other names that day, +0.08 was above average, and the z-score stretched it to 0.883.',
            notes: [['It is what the method does.', 'a dictionary that likes the word “like”']] },
          { callout: 'Sentiment 0.883 is a faithful reading of a dictionary, and a wrong reading of the news. The rewrite did not change the scorers: the hosted app still runs VADER and TextBlob. FinBERT, a finance-trained model, stays optional because my README puts Streamlit Community Cloud’s limit at roughly 1 GB, a figure I never measured.', label: 'Verdict' }
        ] },

      { id: 'month', label: 'Exhibit III', title: 'A month is not a trend',
        art: function (c) {
          return '<polyline points="10,40 40,30 70,25 90,60 115,90 135,95 150,70" fill="none" stroke="' + c.i + '" stroke-width="1.5"/>' +
            '<path d="M130 108 h20 M130 104 v8 M150 104 v8" stroke="' + c.a + '" stroke-width="2" fill="none"/>' +
            '<path d="M10 14 h120 M10 10 v8 M130 10 v8" stroke="' + c.m + '" stroke-width="2" fill="none"/>';
        },
        blocks: [
          { p: 'Momentum 2.440 is easier to explain. The old code measured momentum as the return over the last 21 trading days, about one calendar month: `close / close.shift(21) - 1`.^[git show fc58d85:factors/momentum_factor.py.]' },
          { p: 'ACN’s last month on that chart is [[the bounce|old]] off the June low. Among fifty large stocks, a month like that is near the top of the list. The year behind it is [[the fall|new]].' },
          { widget: 'brackets', size: 'wide',
            caption: 'ACN’s price traced from the OLD deep-dive screenshot, approximate. A trading month is drawn as 30 calendar days; the chart spans 362 days, so its first point stands in for 252 trading days ago. The strip under it is the old 21-day reading on every day it can be computed.' },
          { p: 'The rewrite uses 12-minus-1 momentum: the return from twelve months ago to one month ago, `close.shift(21) / close.shift(252) - 1`. Skipping the latest month is the textbook choice, because one-month returns tend to reverse. On this trace the old reading says {{roc21|+21%}} and the 12−1 reading says {{mom121|−44%}}.' },
          { p: 'Press “Crash the last two weeks”. The old reading lurches; the 12−1 one does not move, because it never looks at the last month. One of the tests does the same: it sets the final ten closes to 50 and checks that the signal is unchanged.^[tests/test_factors.py:33-39, test_skips_most_recent_month.]' },
          { p: 'The strip shows the old reading for every day of the year. It changed sign {{flips|several}} times. That is weather, not a trend. 12−1 also needs a year of prices before it can say anything, so the screener now downloads 400 calendar days of history before a window starts.^[config/settings.py:41-43, WARMUP_DAYS = 400.]' },
          { callout: 'Momentum 2.440 measured a one-month bounce on a stock down about 40% from its high. Fixed on 12 October 2026: momentum is now 12-minus-1, and rows without a year of history are left empty rather than filled with 0.', label: 'Verdict' }
        ] },

      { id: 'sum', label: 'Exhibit IV', title: 'A sum is not an agreement',
        blocks: [
          { p: 'My old overview for this project said a name “only rises to the top when the technicals and the narrative agree”. The arithmetic never did that. The composite is a weighted sum of four z-scores, each computed within one day across the fifty names, clipped to ±3, with a missing value set to 0, the average.',
            notes: [['The arithmetic never did that.', 'the sentence was mine, not the code’s']] },
          { tex: 'c_i = 0.4\\,z^{m}_i + 0.3\\,z^{s}_i + 0.2\\,z^{v}_i + 0.1\\,z^{\\sigma}_i', caption: 'c is the composite; m, s, v, σ are momentum, sentiment, volume and volatility. Default weights (config/settings.py:25-28). The dashboard’s sliders renormalise any weights to sum to 1. A sum lets one strong factor pay for weak ones.' },
          { figure: 'public/assets/projects/quant-current.webp', size: 'wide',
            alt: 'Current dashboard, light theme: window 2025-10-11 to 2026-10-11, default weights, average composite 0.406, top pick DELL at 0.920; the ten rows run DELL, MU, MRVL, BRK-B, MRK, WMT, WFC, CAT, JNJ, UNH.',
            caption: 'The CURRENT code (after 12 October 2026), from the repo’s docs/screenshot-light.png. Every composite in it reproduces from the default weights to three decimals.' },
          { p: '[[DELL|dell]] is first with sentiment 0.000. [[BRK-B|brkb]] is fourth with negative momentum, −0.591, carried by sentiment 1.640. [[MU|mu]]’s momentum is exactly 3.000: the clip. And [[six of the ten|zero]] picks show sentiment 0.000.' },
          { p: 'Those zeros are not neutral news. The app fetches headlines only for the 20 largest names; everyone else gets the average, which after the z-score is exactly 0.^[streamlit_app.py:94-101; scoring_engine.py:74-82.] DELL topped the list without anyone asking what was written about it.' },
          { widget: 'sum', size: 'wide',
            caption: 'The ten real rows. Each bar is the four signed contributions, weight × z, stacked left and right of zero; the tick is the score. “Must agree” is a hypothetical rule (score = the weakest z among weighted factors) that the code does not use.' },
          { p: 'Move the weights. They renormalise to 100% the way the app’s sliders do. Then switch the rule to “must agree”, which scores each name by its weakest factor. Under it {{agreetop|MRK}} leads, DELL drops to eighth and BRK-B to seventh.' },
          { p: 'I am not saying the minimum is better. A weighted sum is a normal choice for a factor model. The claim was the problem, and the claim is gone.' },
          { callout: '“Rises only when the technicals and the narrative agree” was false of the code it described. The sum stays, by design. The sentence went in the 2026-10 rewrite of this page.', label: 'Verdict' }
        ] },

      { id: 'clock', label: 'Exhibit V', title: 'The clock',
        blocks: [
          { p: 'The old backtest said the strategy returned 19.70% against the benchmark’s 21.99%. I published it as an honest loss. It was not honest, though not in the way I meant: three things in it ran on the wrong clock.' },
          { figure: 'public/assets/projects/quant-backtest.webp',
            alt: 'Old backtest panel: strategy 19.70%, benchmark 21.99%, Sharpe 1.20, max drawdown −10.07%, volatility 16.15%, final value $1,197,049.',
            caption: 'The OLD code’s backtest. Contaminated by lookahead and same-day trading; the code linked from this page cannot reproduce it.' },
          { scrolly: 'clock',
            caption: 'A diagram, not data: each row is one stock’s score through time, each cell one trading day.',
            steps: [
              { p: 'Each cell is one stock’s score on one day, computed from prices up to that day’s close. The line is today.', state: { s: 0 } },
              { p: 'Scores need history first: 20 trading days for volume and volatility, 252 for 12−1 momentum. Until then the cell is empty, and so is the composite. The old code filled missing momentum with 0, which ranks a stock with no history as perfectly average.', state: { s: 1 } },
              { p: 'The old backtest traded on the same day’s score, at the same close it was computed from. The new one shifts the signal by a day: picks made with Monday’s close trade at Tuesday’s close.^[backtest_engine.py:81-82; tests/test_pipeline.py:202-216.]', state: { s: 2 } },
              { p: 'Sentiment was worse. There is no history of headlines, only today’s. The old backtest took the sentiment fetched on the day I ran it and painted it onto every past day of the year.^[git show fc58d85:streamlit_app.py, line 111.]', state: { s: 3 } },
              { p: 'Now the backtest sets sentiment’s weight to 0 and ignores any scores passed in. Sentiment reaches only the live ranking, where today’s news belongs.', state: { s: 4 } },
              { p: 'Two tests hold the line. Multiply every future close by 3 and future volume by 10: past scores must not change. Halve the future: the past equity curve must not change.^[tests/test_pipeline.py:107-120 and 218-228.]', state: { s: 5 } }
            ] },
          { p: 'So the 19.70% described a different machine: an alphabetical universe, same-day trades, no costs, the whole book sold every week, and a year of backtest steered by one day’s headlines.' },
          { callout: 'The old backtest numbers are contaminated by lookahead. Fixed on 12 October 2026: sentiment is zeroed in the backtest, the signal is lagged one day, and every trade pays 10 bps.', label: 'Verdict' }
        ] },

      { id: 'rewrite', label: 'Exhibit VI', title: 'The rewrite, and its witnesses',
        blocks: [
          { p: 'On 12 October 2026 I rewrote the parts that were wrong, in one commit: 40 files, 716 lines added and 1,185 removed.^[Commit 512dfaf, “Refactor dependencies and remove unused scripts”.] This is what changed.' },
          { table: { head: ['', 'Before', 'Now (HEAD 2e92f12)'], rows: [
            ['Universe', 'first 50 rows of a list sorted by company name', 'the 50 largest by market cap above $5B and 1M shares a day'],
            ['Momentum', '21-day return, missing = 0', '12-minus-1, missing = empty'],
            ['Volume', 'volume over its 20-day mean', 'the same, signed by the day’s return'],
            ['Sentiment in backtest', 'today’s, on every past day', 'weight 0'],
            ['Timing', 'same-day signal', 'yesterday’s signal'],
            ['Trading', 'sell everything weekly, no costs', 'trade only names that change, 10 bps'],
            ['Significance', 'none', '2,000 random portfolios, p-value'],
            ['Tests', '25', '39, all passing on 2026-10-16']
          ] }, caption: 'From git show fc58d85 (before) and the repo at 2e92f12 (now).' },
          { p: 'The backtest now sells only names that leave the top ten and buys only names that enter. In my re-run that meant about 4.35 of ten seats changing each week, 49.5 times the starting capital traded over the year, and $49,494 of costs on $1M.^[Re-run 2026-10-16; turnover and total_costs from the engine.] LRCX sat in a seat 46 of 50 weeks and MU 45.' },
          { code: "scores_df = scoring_engine.compute(price_data, None, weights={'sentiment': 0.0})\n...\n# Trade on yesterday's signal.\nsignal = scores_df['composite'].groupby(level='Ticker').shift(1).unstack('Ticker')", lang: 'python',
            caption: 'pipeline/backtest_engine.py:76-82. Two lines carry two of the fixes: no sentiment in the past, and no trading on a score before it exists.' },
          { p: 'The tests are the witnesses. Each pins one guarantee: the lag, the shocked future, sentiment ignored, only changed names traded. They run on Python 3.10 and 3.11 on every push, without Streamlit or torch installed, so they stay fast.',
            notes: [['The tests are the witnesses.', 'thirty-nine of them, and none for the CLI']] },
          { p: 'The hosted app runs on Streamlit Community Cloud, which puts an idle app to sleep. A GitHub Actions job opens it in headless Chrome every ten hours to keep it awake.' },
          { live: true },
          { callout: 'The universe was alphabetical and the trades were free. Fixed on 12 October 2026, with a test for each fix.', label: 'Verdict' }
        ] },

      { id: 'dartboard', label: 'Exhibit VII', title: 'The dartboard',
        art: function (c) {
          return '<circle cx="80" cy="60" r="44" fill="none" stroke="' + c.l + '" stroke-width="1.5"/>' +
            '<circle cx="80" cy="60" r="28" fill="none" stroke="' + c.l + '" stroke-width="1.5"/>' +
            '<circle cx="80" cy="60" r="10" fill="none" stroke="' + c.a + '" stroke-width="2"/>' +
            '<line x1="96" y1="44" x2="140" y2="10" stroke="' + c.i + '" stroke-width="2"/>';
        },
        blocks: [
          { p: 'With the fixes in, I re-ran the current code on 16 October 2026 over the same window as the repo’s screenshot, 11 October 2025 to 11 October 2026.^[scratchpad run_bt.py: HEAD 2e92f12, defaults, START 2025-10-11, END 2026-10-11; trading 2025-10-13 to 2026-10-09.] It returned +70.1%. SPY returned +18.7%. Sharpe 1.60 against SPY’s 1.43. That looks like a result.' },
          { p: 'It also fell 22.7% from its peak between 30 June and 29 July, where SPY’s worst fall was 8.9%, and its volatility was three times SPY’s: 38.2% against 12.7%.' },
          { p: 'The rewrite added one more number, and it is the one I trust. At each of the 50 weekly rebalances the engine builds 2,000 random portfolios: ten names drawn at random from the same pool of 50 the screener chose from, held for the same week. Compounded over the year, each random portfolio is a dart. If the picks are skill, few darts should beat them.' },
          { widget: 'dartboard', size: 'full',
            caption: 'A re-run on 2026-10-16 of the repo’s HEAD (2e92f12) over 2025-10-11 → 2026-10-11, using today’s 50 largest constituents (so survivorship is built in). Each dart is one of the engine’s 2,000 random portfolios, compounded, gross of costs; seed 0. The picks are marked at +68.6% gross, SPY at +18.7%. 134 darts did at least as well: p = 135 / 2,001 = 0.067.' },
          { p: 'Throw them. [[SPY|spy]] sits far to the left. [[The median dart|median]] made +43.8%, gross of costs. [[The picks|picks]] made +68.6% on the same terms. The counter reads {{darts|0 of 0}}; once all 2,000 are thrown it settles at 134 of 2,000, and p = 0.067.' },
          { p: 'Most of the +70% is the universe. Every dart was drawn from today’s 50 largest US companies, and a company is among today’s largest mostly because its stock went up. Picking at random from that list already beat SPY by about 25 points before costs. That is survivorship bias, and the README warns about it.',
            notes: [['Most of the +70% is the universe.', 'the hardest sentence on this page to write']] },
          { p: 'What is left, the picks against the darts, is +68.6% against +43.8%. Luck matches or beats that about one time in fifteen. It is not significant at 5%. The picks beat the median dart in 28 of the 50 weeks; select a week under the board to see what was held. In 19 of them the screener held GOOG and GOOGL at once, which are one company.' },
          { quote: 'The most useful thing this screener does is tell me its own result might be luck.' },
          { callout: 'Beat SPY, p = 0.07. Not fixed: the universe is still today’s largest companies, so the beat over SPY is mostly survivorship.', label: 'Verdict' }
        ] }
    ],

    closing: { blocks: [
      { p: 'Each of these comes from something the exhibits found.' },
      { list: [
        '**Point-in-time constituents.** Build the universe from the index as it stood on each rebalance date, with that day’s market caps. Today’s 50 largest is a list of winners, and the dartboard shows what that is worth.',
        '**Stored sentiment history.** Save each week’s headline scores so a backtest can replay them. Until then sentiment cannot be tested at all, and its 0.3 weight is a guess.',
        '**De-duplicate share classes.** GOOG and GOOGL are both in the universe and were held together for 19 weeks: one company, one bet at double size.',
        '**A constrained news query.** NewsAPI is asked for the bare ticker, five results by relevance, with no date filter; the README’s “last 7 days” is never enforced.^[yahoo_finance.py:64 and 76-81: lookback_days only enters the cache key.] I would filter by date and by company name, and score with a finance model where there is memory for one.',
        '**More than one window.** One year is one sample. I would test several windows and fit the weights on a rolling window before trusting 0.4 / 0.3 / 0.2 / 0.1.',
        '**Fix the CLI.** `python app.py` crashes after its backtest: it passes `cross_sectional_normalize`, a keyword `ScoringEngine.compute` no longer accepts, and no test covers it.^[app.py:99; scoring_engine.py:16-17.]'
      ] }
    ] },

    sources: [
      ['Exhibit A (old code)', 'public/assets/projects/quant-dashboard.webp: ACN 0.983, momentum 2.440, sentiment 0.883, volume −0.749, volatility −1.078; average 0.667; GOOGL sentiment 3.000.'],
      ['ACN deep dive (old code)', 'quant-deepdive.webp: confidence 72%, the five headlines. Prices ($288 high on 2026-01-14, $125 low on 2026-06-29, $167 at the end, about −42%; +21% over the last 30 days, −44% for 12−1) traced by tools/quant-trace-acn.py, approximate.'],
      ['VADER and TextBlob', 'sent.py run 2026-10-16 in the repo’s venv (vaderSentiment 3.3.2, TextBlob 0.20): compounds +0.3818, −0.4215, +0.0772, +0.6124, +0.3724; TextBlob 0, 0, −0.125, 0, −0.4; means +0.2045 / −0.105; ensemble +0.0807, confidence 0.7242. Lexicon: vader_lexicon.txt (7,519 lines; growth 1.6, like 1.5, challenges 0.3, struggling −1.8, worse −2.1); N_SCALAR −0.74 and alpha 15 in vaderSentiment.py.'],
      ['Model constants', 'config/settings.py: universe 50, $5B, 1M shares (17-19); weights 0.4/0.3/0.2/0.1 (25-28); 1y, every 5 days, top 10, 10 bps, 2,000 draws (34-39); WARMUP_DAYS 400 (41-43). Headlines for the first 20 names: streamlit_app.py:94-101.'],
      ['Current table', 'quantamental-screener/docs/screenshot-light.png, run 2025-10-11 → 2026-10-11: ten rows, DELL 0.920 … UNH 0.176, average 0.406. Composites recomputed from the default weights.'],
      ['Old backtest', 'quant-backtest.webp: 19.70% vs 21.99%, Sharpe 1.20, max drawdown −10.07%. Produced by code before 512dfaf (git show fc58d85).'],
      ['Rewrite', 'Commit 512dfaf, 2026-10-12: 40 files, +716/−1,185. Tests: 5 + 11 + 23 = 39, all passing 2026-10-16; 25 before (fc58d85). Wake job: .github/workflows/wake.yml, cron every 10 h.'],
      ['Re-run', 'run_bt.py on 2026-10-16, HEAD 2e92f12, defaults, 2025-10-11 → 2026-10-11, today’s universe: +70.08% vs SPY +18.69%, Sharpe 1.60 (SPY 1.43), max drawdown −22.67% (2026-06-30 → 07-29; SPY −8.9%), volatility 38.2% (SPY 12.7%), 50 rebalances, turnover 49.49×, costs $49,494, p = 0.0675.'],
      ['Dartboard', 'Same re-run, backtest_engine.py:204-233: 2,000 random portfolios, seed 0; 134 ≥ the picks; picks +68.6% gross; median dart +43.8%; 5th–95th percentile +21.4% to +70.9%; min +2.3%, max +102.3%. Picks above the median dart in 28 of 50 weeks; 4.35 seats changed per week; LRCX held 46 weeks, MU 45; GOOG and GOOGL together 19 weeks.']
    ],

    widgets: {
      /* ---------- the evidence ledger (rail) ---------- */
      ledger: function (host, kit) {
        var ROWS_L = [
          ['top-pick', 'I', 'ACN is the top pick, 0.983', 'the old code’s weighted sum', 'On trial', '—'],
          ['dictionary', 'II', 'Sentiment +0.883: the news is good', 'VADER + TextBlob lexicons; “like” +1.5 twice', 'Faithful to the method, wrong about the news', 'No: same scorers'],
          ['month', 'III', 'Momentum 2.440: a strong trend', '21-day return on a one-month bounce', 'False: down ~40% from its high', 'Yes: 12−1 momentum'],
          ['sum', 'IV', 'Names rise only when signals agree', 'a weighted sum, not an agreement', 'False', 'Claim removed; sum kept'],
          ['clock', 'V', 'Backtest 19.70% vs 21.99%', 'today’s sentiment on past days, same-day trades, no costs', 'Contaminated', 'Yes: lag, 10 bps, no sentiment'],
          ['rewrite', 'VI', 'Universe: the S&P 500', 'first 50 names by company name', 'Misleading', 'Yes: 50 largest by cap'],
          ['dartboard', 'VII', 'Beat SPY by 51 points (re-run)', 'today’s largest companies: survivorship', 'Not significant: p = 0.067', 'No']
        ];
        var wide = window.matchMedia('(min-width: 1360px)');
        var det = kit.el('details', { class: 'qs-ledger' });
        var count = kit.el('span', { class: 'qs-ledger__n' });
        det.appendChild(kit.el('summary', null, kit.el('span', { class: 'qs-ledger__t', text: 'Evidence ledger' }), count));
        var ol = kit.el('ol', { class: 'qs-ledger__list' });
        var items = ROWS_L.map(function (r) {
          var li = kit.el('li', { class: 'qs-ledger__row' },
            kit.el('span', { class: 'qs-ledger__ex', text: 'Exhibit ' + r[1] }),
            kit.el('p', { class: 'qs-ledger__claim', text: r[2] }),
            kit.el('dl', null,
              kit.el('dt', { text: 'Produced by' }), kit.el('dd', { text: r[3] }),
              kit.el('dt', { text: 'Verdict' }), kit.el('dd', { class: 'qs-ledger__v', text: r[4] }),
              kit.el('dt', { text: 'Fixed 2026-10-12?' }), kit.el('dd', { text: r[5] })));
          ol.appendChild(li);
          return li;
        });
        det.appendChild(ol);
        host.appendChild(det);
        var cur = null;
        function paint() {
          var at = -1;
          ROWS_L.forEach(function (r, i) { if (r[0] === cur) at = i; });
          if (cur === 'differently') at = ROWS_L.length - 1;
          var n = 0;
          items.forEach(function (li, i) {
            var shown = !wide.matches || i <= at;
            li.classList.toggle('is-sealed', !shown);
            li.classList.toggle('is-current', wide.matches && i === at);
            if (shown) n++;
          });
          count.textContent = n + ' of ' + ROWS_L.length + ' entered';
          det.open = wide.matches;
        }
        wide.addEventListener('change', paint);
        kit.onChapter(function (ch) { cur = ch; paint(); });
        paint();
      },

      /* ---------- VADER strips ---------- */
      strips: function (host, kit) {
        var sel = 0, extra = 0, keyOn = null;
        var list = kit.el('div', { class: 'qs-strips' });
        var rows = HEADS.map(function (h, i) {
          var words = kit.el('span', { class: 'qs-strip__words' });
          h.spans = h.w.map(function (w) {
            var cls = 'qs-w' + (w[1] ? ' qs-w--known' : '') + (w[3] ? ' qs-w--miss' : '');
            var s = kit.el('span', { class: cls, 'data-k': w[2] || '' }, w[0]);
            if (w[1]) s.appendChild(kit.el('sup', { class: 'qs-w__v', text: w[4] ? '+1.55' : sgn(w[1], 1) }));
            if (w[3]) s.appendChild(kit.el('sup', { class: 'qs-w__v', text: 'not in lexicon' }));
            words.appendChild(s); words.appendChild(document.createTextNode(' '));
            return s;
          });
          var v = kit.el('span', { class: 'qs-strip__n' }), t = kit.el('span', { class: 'qs-strip__n' });
          var b = kit.el('button', { type: 'button', class: 'qs-strip', 'aria-pressed': 'false',
            on: { click: function () { sel = i; draw(); } } }, words,
            kit.el('span', { class: 'qs-strip__nums' }, kit.el('span', { class: 'qs-strip__k', text: 'VADER' }), v,
              kit.el('span', { class: 'qs-strip__k', text: 'TextBlob' }), t));
          b._v = v; b._t = t;
          list.appendChild(b);
          return b;
        });
        var curve = kit.svg('svg', { class: 'qs-curve', viewBox: '0 0 260 130', 'aria-hidden': 'true' });
        var slider = kit.slider({ label: 'Your valence: missing words', min: -3, max: 0, step: 0.1, value: 0,
          format: function (x) { return x === 0 ? 'absent' : sgn(x, 1); }, onInput: function (x) { extra = x; draw(); } });
        var rv = kit.readout('VADER mean', ''), rt = kit.readout('TextBlob mean', ''),
            re = kit.readout('Ensemble 0.6 / 0.4', '', 'k-readout--accent'), rc = kit.readout('Confidence', '');
        host.appendChild(list);
        host.appendChild(kit.el('div', { class: 'qs-strips__foot' }, curve,
          kit.el('div', { class: 'qs-strips__meter' }, kit.el('div', { class: 'k-row' }, rv.el, rt.el, re.el, rc.el), slider.el)));

        function sums() {
          return HEADS.map(function (h) {
            return h.w.reduce(function (s, w) { return s + (w[1] || 0) + (w[3] ? extra : 0); }, 0);
          });
        }
        function draw() {
          var col = kit.colors(), x = sums(), vs = x.map(compound), ts = HEADS.map(function (h) { return h.tb; });
          rows.forEach(function (b, i) {
            b.setAttribute('aria-pressed', String(i === sel));
            b._v.textContent = sgn(vs[i], 4); b._t.textContent = sgn(ts[i], 3);
          });
          var vm = mean(vs), tm = mean(ts), vc = 1 - pstd(vs), tc = 1 - pstd(ts);
          var ens = 0.6 * vm + 0.4 * tm, conf = 0.6 * vc + 0.4 * tc;
          rv.set(sgn(vm, 4)); rt.set(sgn(tm, 4)); re.set(sgn(ens, 4)); rc.set((conf * 100).toFixed(2) + '%');
          kit.live('ens', sgn(ens, 4)); kit.live('conf', (conf * 100).toFixed(0) + '%');
          // the curve x/√(x²+15), x from −6 to 6
          var X = function (v) { return 20 + (v + 6) / 12 * 220; }, Y = function (c) { return 65 - c * 50; };
          var d = '';
          for (var k = 0; k <= 60; k++) { var xv = -6 + k * 0.2; d += (k ? 'L' : 'M') + X(xv).toFixed(1) + ' ' + Y(compound(xv)).toFixed(1); }
          curve.textContent = '';
          curve.appendChild(kit.svg('line', { x1: 20, y1: 65, x2: 240, y2: 65, stroke: col.line }));
          curve.appendChild(kit.svg('line', { x1: 130, y1: 12, x2: 130, y2: 118, stroke: col.line }));
          curve.appendChild(kit.svg('path', { d: d, fill: 'none', stroke: col.inkSoft, 'stroke-width': 1.5 }));
          x.forEach(function (xv, i) {
            curve.appendChild(kit.svg('circle', { cx: X(xv), cy: Y(compound(xv)), r: i === sel ? 6 : 3,
              fill: i === sel ? col.accent : 'none', stroke: col.accent, 'stroke-width': 1.5 }));
          });
          curve.appendChild(kit.svg('text', { x: 22, y: 126, fill: col.inkMuted, 'font-size': 10, text: 'sum −6' }));
          curve.appendChild(kit.svg('text', { x: 238, y: 126, fill: col.inkMuted, 'font-size': 10, 'text-anchor': 'end', text: '+6' }));
          curve.appendChild(kit.svg('text', { x: 134, y: 20, fill: col.inkMuted, 'font-size': 10, text: 'compound +1' }));
          curve.appendChild(kit.svg('text', { x: X(x[sel]), y: Y(compound(x[sel])) + 20, fill: col.ink, 'font-size': 11,
            'text-anchor': 'middle', text: sgn(x[sel], 2) + ' → ' + sgn(compound(x[sel]), 4) }));
        }
        kit.onKey(function (k) {
          keyOn = k;
          HEADS.forEach(function (h) { h.spans.forEach(function (s) {
            s.classList.toggle('is-key', !!k && s.getAttribute('data-k') === k);
          }); });
        });
        kit.onTheme(draw);
        draw();
      },

      /* ---------- 21-day vs 12−1 on ACN ---------- */
      brackets: function (host, kit) {
        var show = 'both', crash = false, hl = null, N = ACN.length - 1, M = 30;
        function series() { return ACN.map(function (v, i) { return crash && i > N - 14 ? v * 0.5 : v; }); }
        function readings(p) { return { old: p[N] / p[N - M] - 1, nu: p[N - M] / p[0] - 1 }; }
        var ro = kit.readout('Old: 21-day', ''), rn = kit.readout('New: 12 − 1', '', 'k-readout--accent');
        var ch = kit.choice({ label: 'Show', value: 'both', options: [
          { value: 'old', label: 'Old 21-day' }, { value: 'new', label: 'New 12−1' }, { value: 'both', label: 'Both' }],
          onChange: function (v) { show = v; cv.draw(); } });
        var cb = kit.el('button', { type: 'button', class: 'k-btn', 'aria-pressed': 'false', text: 'Crash the last two weeks',
          on: { click: function () { crash = !crash; cb.setAttribute('aria-pressed', String(crash)); upd(); } } });
        host.appendChild(kit.el('div', { class: 'k-row' }, ch.el, cb, ro.el, rn.el));
        var cv = kit.canvas(host, { height: window.innerWidth < 600 ? 260 : 340, draw: function (ctx, w, h) {
          var col = kit.colors(), p = series(), r = readings(p);
          var L = 40, R = w - 10, T = 14, B = h - 84, s0 = h - 44, s1 = h - 8;
          var X = function (i) { return L + i / N * (R - L); }, Y = function (v) { return B - (v - 50) / (300 - 50) * (B - T); };
          ctx.font = '11px ' + getComputedStyle(host).fontFamily; ctx.fillStyle = col.inkMuted; ctx.strokeStyle = col.line; ctx.lineWidth = 1;
          [100, 150, 200, 250, 300].forEach(function (v) { ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(R, Y(v)); ctx.stroke(); ctx.fillText('$' + v, 2, Y(v) + 4); });
          ['Sep', 'Nov', 'Jan', 'Mar', 'May', 'Jul'].forEach(function (m, k) {
            var i = [26, 87, 148, 207, 268, 329][k]; ctx.fillText(m, X(i) - 8, B + 14);
          });
          function band(a, b, fill, label, val, y, key) {
            var dim = hl && hl !== key;
            ctx.globalAlpha = dim ? 0.25 : 1;
            ctx.fillStyle = fill; ctx.globalAlpha *= 0.18; ctx.fillRect(X(a), T, X(b) - X(a), B - T); ctx.globalAlpha = dim ? 0.25 : 1;
            ctx.strokeStyle = fill; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.moveTo(X(a), Y(p[a])); ctx.lineTo(X(b), Y(p[b])); ctx.stroke();
            [a, b].forEach(function (i) { ctx.beginPath(); ctx.arc(X(i), Y(p[i]), 4, 0, 7); ctx.fill(); });
            ctx.fillStyle = col.ink; ctx.font = '600 12px ' + getComputedStyle(host).fontFamily;
            var tx = Math.min(X(a) + 6, R - 150);
            ctx.fillText(label + ' ' + pct(val, 0), tx, y);
            ctx.globalAlpha = 1; ctx.font = '11px ' + getComputedStyle(host).fontFamily;
          }
          if (show !== 'old') {
            band(0, N - M, col.series[1], '12−1:', r.nu, T + 14, 'new');
            ctx.fillStyle = col.inkMuted; ctx.fillText('skipped', Math.min(X(N - M) + 2, R - ctx.measureText('skipped').width), T + 30);
          }
          ctx.strokeStyle = col.ink; ctx.lineWidth = 1.4; ctx.beginPath();
          p.forEach(function (v, i) { if (i) ctx.lineTo(X(i), Y(v)); else ctx.moveTo(X(i), Y(v)); }); ctx.stroke();
          if (show !== 'new') band(N - M, N, col.series[0], '21-day:', r.old, T + 48, 'old');
          // strip: old reading through the year
          ctx.fillStyle = col.inkMuted; ctx.fillText('old 21-day reading, daily', L, s0 - 6);
          var mid = (s0 + s1) / 2; ctx.strokeStyle = col.line; ctx.beginPath(); ctx.moveTo(L, mid); ctx.lineTo(R, mid); ctx.stroke();
          ctx.fillStyle = col.series[0];
          for (var i = M; i <= N; i++) { var q = p[i] / p[i - M] - 1; var hh = Math.max(-1, Math.min(1, q / 0.35)) * (s1 - s0) / 2; ctx.fillRect(X(i), mid - Math.max(hh, 0), Math.max(1, (R - L) / N), Math.abs(hh)); }
        } });
        function upd() {
          var p = series(), r = readings(p), flips = 0, last = 0;
          for (var i = M; i <= N; i++) { var s = Math.sign(p[i] / p[i - M] - 1); if (s && last && s !== last) flips++; if (s) last = s; }
          ro.set(pct(r.old, 0)); rn.set(pct(r.nu, 0));
          kit.live('roc21', pct(r.old, 0)); kit.live('mom121', pct(r.nu, 0)); kit.live('flips', String(flips));
          kit.announce('Old reading ' + pct(r.old, 0) + ', 12 minus 1 reading ' + pct(r.nu, 0));
          cv.draw();
        }
        kit.onKey(function (k) { hl = k === 'old' || k === 'new' ? k : null; cv.draw(); });
        upd();
      },

      /* ---------- a sum is not an agreement ---------- */
      sum: function (host, kit) {
        var w = [0.4, 0.3, 0.2, 0.1], rule = 'sum', hl = null;
        var sliders = FACT.map(function (f, k) {
          return kit.slider({ label: f[2] + ' ' + f[1], min: 0, max: 1, step: 0.05, value: w[k],
            format: function (v) { return v.toFixed(2); }, onInput: function (v) { w[k] = v; upd(true); } });
        });
        var norm = kit.readout('Normalised', '');
        var ch = kit.choice({ label: 'Rule', value: 'sum', options: [
          { value: 'sum', label: 'Weighted sum (the code)' }, { value: 'min', label: 'Must agree (hypothetical)' }],
          onChange: function (v) { rule = v; upd(true); } });
        host.appendChild(kit.el('div', { class: 'k-row qs-sum__ctl' }, sliders.map(function (s) { return s.el; })));
        host.appendChild(kit.el('div', { class: 'k-row' }, ch.el, norm.el));
        var legend = kit.el('p', { class: 'qs-sum__legend' });
        FACT.forEach(function (f, k) { legend.appendChild(kit.el('span', { class: 'qs-sw qs-f' + k, text: f[2] + ' ' + f[1] })); });
        legend.appendChild(kit.el('span', { class: 'qs-badge', text: '○ sentiment never asked' }));
        host.appendChild(legend);
        var box = kit.el('ol', { class: 'qs-sum' });
        var els = ROWS.map(function (r) {
          var segs = FACT.map(function (f, k) { return kit.el('span', { class: 'qs-seg qs-f' + k }); });
          var track = kit.el('span', { class: 'qs-sum__track' }, segs, kit.el('span', { class: 'qs-sum__zero' }), kit.el('span', { class: 'qs-sum__tick' }));
          var sc = kit.el('span', { class: 'qs-sum__score' });
          var li = kit.el('li', { class: 'qs-sum__row', 'data-k': r[0] === 'BRK-B' ? 'brkb' : r[0].toLowerCase() },
            kit.el('span', { class: 'qs-sum__tk' }, r[0], r[2] === 0 ? kit.el('span', { class: 'qs-badge', title: 'sentiment 0.000: not among the 20 names whose news was fetched', text: '○' }) : null,
              r[1] >= 3 ? kit.el('span', { class: 'qs-badge', text: 'clip' }) : null),
            track, sc);
          li._r = r; li._segs = segs; li._tick = track.lastChild; li._sc = sc;
          box.appendChild(li);
          return li;
        });
        host.appendChild(box);
        function upd(animate) {
          var tot = w.reduce(function (a, b) { return a + b; }, 0) || 1, nw = w.map(function (x) { return x / tot; });
          norm.set(nw.map(function (x) { return Math.round(x * 100); }).join(' / ') + ' = 100%');
          var scale = 1;
          els.forEach(function (li) {
            var r = li._r, c = nw.map(function (x, k) { return x * r[k + 1]; });
            var pos = c.filter(function (v) { return v > 0; }).reduce(function (a, b) { return a + b; }, 0);
            var neg = c.filter(function (v) { return v < 0; }).reduce(function (a, b) { return a + b; }, 0);
            scale = Math.max(scale, pos, -neg);
            li._c = c;
            var zs = r.slice(1).filter(function (z, k) { return nw[k] > 0; });
            li._score = rule === 'sum' ? c.reduce(function (a, b) { return a + b; }, 0) : (zs.length ? Math.min.apply(null, zs) : 0);
          });
          scale = Math.max(scale, 1.7);
          var mutate = function () {
            els.slice().sort(function (a, b) { return b._score - a._score; }).forEach(function (li) { box.appendChild(li); });
            els.forEach(function (li) {
              var p = 50, n = 50;
              li._c.forEach(function (v, k) {
                var wd = Math.abs(v) / scale * 50, s = li._segs[k];
                if (v >= 0) { s.style.left = p + '%'; p += wd; } else { n -= wd; s.style.left = n + '%'; }
                s.style.width = wd + '%';
                s.textContent = wd > 6 ? FACT[k][2] : '';
              });
              li._tick.style.left = (50 + Math.max(-50, Math.min(50, li._score / scale * 50))) + '%';
              li._sc.textContent = (li._score < 0 ? '−' : '') + Math.abs(li._score).toFixed(3);
              li.setAttribute('aria-label', li._r[0] + ': score ' + li._sc.textContent + '. ' +
                FACT.map(function (f, k) { return f[1] + ' z ' + li._r[k + 1].toFixed(3); }).join(', '));
            });
          };
          if (animate) kit.flip(box, mutate); else mutate();
          var top = box.firstChild._r[0];
          kit.live('agreetop', rule === 'min' ? top : 'MRK');
          kit.announce('Top: ' + top);
        }
        kit.onKey(function (k) {
          hl = k;
          els.forEach(function (li) {
            var on = !k || li.getAttribute('data-k') === k || (k === 'zero' && li._r[2] === 0);
            li.classList.toggle('is-dim', !on);
          });
        });
        upd(false);
      },

      /* ---------- the clock (scrolly, diagrammatic) ---------- */
      clock: function (host, kit) {
        var st = 0;
        var box = kit.el('div', { class: 'qs-clock' });
        host.appendChild(box);
        var label = kit.el('p', { class: 'qs-clock__say', 'aria-live': 'polite' });
        host.appendChild(label);
        var SAY = ['Scores by day; the line is today.', 'Warm-up: empty until there is enough history.',
          'Trade on yesterday’s score.', 'OLD: today’s sentiment painted over the past (lookahead).',
          'NOW: sentiment weight 0 in the backtest; live ranking only.', 'Shock the future: the past must not move.'];
        function draw() {
          var col = kit.colors(), W = Math.max(280, box.clientWidth || 600), narrow = W < 520;
          var lw = narrow ? 64 : 92, cols = narrow ? 18 : 30, cw = (W - lw - 4) / cols, rh = narrow ? 20 : 26, H = rh * 5 + 62;
          var today = cols - (narrow ? 5 : 8);
          var s = kit.svg('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', 'aria-hidden': 'true' });
          var names = ['momentum', 'volume', 'volatility', 'sentiment', 'composite'];
          var warm = [narrow ? 8 : 13, 3, 3, 0, narrow ? 8 : 13];
          names.forEach(function (nm, r) {
            var y = 6 + r * rh;
            s.appendChild(kit.svg('text', { x: 0, y: y + rh * 0.66, 'font-size': narrow ? 10 : 12, fill: col.inkSoft, text: nm }));
            for (var c = 0; c < cols; c++) {
              var x = lw + c * cw, fill = col.bgSunken, stroke = col.line, txt = '';
              var future = c > today;
              if (st >= 1 && c < warm[r]) { fill = 'none'; stroke = col.lineStrong; txt = '·'; }
              else if (r === 3) {
                if (st === 3 && c <= today) { fill = col.series[2]; txt = '!'; }
                else if (st >= 4 && c === today) { fill = col.series[2]; }
                else if (st >= 4) { fill = 'none'; txt = c === 0 ? '' : ''; }
              } else if (r === 4 && st >= 2 && c === today - 1) { fill = col.accent; }
              if (future) { fill = st === 5 ? col.accentPale : 'none'; txt = st === 5 ? '×3' : ''; stroke = col.line; }
              s.appendChild(kit.svg('rect', { x: x + 1, y: y + 2, width: cw - 2, height: rh - 4, rx: 2, fill: fill, stroke: stroke }));
              if (txt && cw > 12) s.appendChild(kit.svg('text', { x: x + cw / 2, y: y + rh * 0.66, 'font-size': 9, 'text-anchor': 'middle', fill: col.ink, text: txt }));
            }
          });
          var tx = lw + (today + 1) * cw;
          s.appendChild(kit.svg('line', { x1: tx, y1: 2, x2: tx, y2: 6 + 5 * rh, stroke: col.ink, 'stroke-width': 2 }));
          s.appendChild(kit.svg('text', { x: tx - 3, y: 6 + 5 * rh + 14, 'font-size': 11, 'text-anchor': 'end', fill: col.ink, text: 'today' }));
          if (st >= 1) s.appendChild(kit.svg('text', { x: lw, y: 6 + 5 * rh + 30, 'font-size': 11, fill: col.inkMuted, text: 'warm-up (252 / 20 days, not to scale)' }));
          if (st === 2) {
            var ax = lw + (today - 0.5) * cw, ay = 6 + 4.5 * rh;
            s.appendChild(kit.svg('path', { d: 'M' + ax + ' ' + ay + ' Q ' + (ax + cw) + ' ' + (ay + rh) + ' ' + (ax + cw) + ' ' + (6 + 5 * rh + 4), fill: 'none', stroke: col.accent, 'stroke-width': 2 }));
            s.appendChild(kit.svg('text', { x: ax + cw + 4, y: 6 + 5 * rh + 46, 'font-size': 11, fill: col.ink, text: 'trade at today’s close' }));
          }
          if (st === 3) s.appendChild(kit.svg('text', { x: lw, y: 6 + 5 * rh + 46, 'font-size': 11, fill: col.ink, text: '! = today’s headlines on a past day' }));
          if (st === 5) s.appendChild(kit.svg('text', { x: lw, y: 6 + 5 * rh + 46, 'font-size': 11, fill: col.ink, text: '×3 = future prices shocked; past cells unchanged' }));
          box.textContent = ''; box.appendChild(s);
          label.textContent = SAY[st];
        }
        if (window.ResizeObserver) new ResizeObserver(function () { draw(); }).observe(box);
        kit.onTheme(draw);
        draw();
        return { set: function (state) { st = state.s || 0; draw(); } };
      },

      /* ---------- the dartboard ---------- */
      dartboard: function (host, kit) {
        var LO = -0.05, HI = 1.1, BW = 0.025, NB = Math.round((HI - LO) / BW);
        var gross = DARTS.map(function (l) { return Math.expm1(l / 1e4); });
        var PICK = Math.expm1(PICKS_LOG / 1e4), SPY = 0.1869, MED = 0.438;
        var order = DARTS.map(function (_, i) { return i; }), r = kit.rng(7);
        for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = order[i]; order[i] = order[j]; order[j] = t; }
        var thrown = 0, hits = 0, bins = new Array(NB).fill(0), flying = [], hl = null;
        var rT = kit.readout('Darts thrown', '0'), rH = kit.readout('At least as good as the picks', '0'),
            rP = kit.readout('p = (1 + hits) / (thrown + 1)', '—', 'k-readout--accent');
        var btns = [kit.button('Throw one dart', function () { go(1); }, 'k-btn--primary'),
          kit.button('Throw 100', function () { go(100); }), kit.button('Throw all 2,000', function () { go(2000); }),
          kit.button('Reset', function () { thrown = hits = 0; bins.fill(0); flying = []; out(); cv.draw(); })];
        host.appendChild(kit.el('div', { class: 'k-row' }, btns));
        var cv = kit.canvas(host, { height: window.innerWidth < 600 ? 250 : 340, draw: function (ctx, w, h) {
          var col = kit.colors(), L = 14, R = w - 14, T = 34, B = h - 30;
          var X = function (v) { return L + (v - LO) / (HI - LO) * (R - L); };
          var maxB = 160, bh = (B - T) / maxB, font = getComputedStyle(host).fontFamily;
          ctx.font = '11px ' + font;
          ctx.fillStyle = col.accentTint; ctx.fillRect(X(PICK), T - 20, R - X(PICK), B - T + 20);
          for (var b = 0; b < NB; b++) {
            var x0 = X(LO + b * BW), lo = LO + b * BW;
            ctx.fillStyle = lo >= PICK - 1e-9 || lo + BW > PICK ? col.accent : col.lineStrong;
            if (lo + BW > PICK && lo < PICK) ctx.fillStyle = col.accentMid;
            ctx.globalAlpha = hl && hl !== 'median' && hl !== 'picks' ? 0.4 : 1;
            ctx.fillRect(x0 + 1, B - bins[b] * bh, X(LO + BW) - X(LO) - 2, bins[b] * bh);
          }
          ctx.globalAlpha = 1;
          flying.forEach(function (f) { ctx.fillStyle = col.accent; ctx.beginPath(); ctx.arc(X(f.v), T + (B - T) * f.t, 3, 0, 7); ctx.fill(); });
          ctx.strokeStyle = col.ink; ctx.beginPath(); ctx.moveTo(L, B); ctx.lineTo(R, B); ctx.stroke();
          ctx.fillStyle = col.inkMuted;
          [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { ctx.fillText((v * 100) + '%', X(v) - 10, B + 16); });
          function mark(v, label, key, dash, y) {
            ctx.globalAlpha = hl && hl !== key ? 0.3 : 1;
            ctx.strokeStyle = col.ink; ctx.lineWidth = key === hl ? 3 : 1.6; ctx.setLineDash(dash);
            ctx.beginPath(); ctx.moveTo(X(v), T - 18); ctx.lineTo(X(v), B); ctx.stroke(); ctx.setLineDash([]);
            ctx.fillStyle = col.ink; ctx.font = '600 11px ' + font;
            var tw = ctx.measureText(label).width, tx = X(v) + 4 + tw > R ? X(v) - 4 - tw : X(v) + 4;
            ctx.fillText(label, tx, y); ctx.font = '11px ' + font; ctx.globalAlpha = 1; ctx.lineWidth = 1;
          }
          mark(SPY, 'SPY +18.7%', 'spy', [4, 3], T - 6);
          if (thrown >= 2000 || hl === 'median') mark(MED, 'median dart +43.8%', 'median', [2, 2], T + 10);
          mark(PICK, 'the picks +68.6%', 'picks', [], T - 6);
        } });
        host.appendChild(kit.el('div', { class: 'k-row' }, rT.el, rH.el, rP.el));
        var anim = kit.loop(function (dt) {
          flying.forEach(function (f) { f.t += dt * 2.2; });
          flying = flying.filter(function (f) { if (f.t >= 1) { land(f.i); return false; } return true; });
          cv.draw(); out();
          if (!flying.length) return false;
        });
        function land(i) {
          var v = gross[i]; bins[Math.max(0, Math.min(NB - 1, Math.floor((v - LO) / BW)))]++;
          thrown++; if (DARTS[i] >= PICKS_LOG) hits++;
        }
        function go(n) {
          var start = thrown + flying.length, end = Math.min(2000, start + n);
          if (start >= 2000) return;
          if (kit.reduced || n > 100 || !kit.visible) { for (var k = start; k < end; k++) land(order[k]); out(); cv.draw(); return; }
          for (var k2 = start; k2 < end; k2++) flying.push({ i: order[k2], v: gross[order[k2]], t: -(k2 - start) * 0.02 });
          anim.start();
        }
        function out() {
          rT.set(kit.fmt(thrown)); rH.set(kit.fmt(hits));
          var p = thrown ? (1 + hits) / (thrown + 1) : null;
          rP.set(p == null ? '—' : p.toFixed(3));
          kit.live('darts', kit.fmt(hits) + ' of ' + kit.fmt(thrown));
          kit.live('pval', p == null ? '—' : p.toFixed(3));
          if (thrown === 2000) kit.announce('All 2,000 thrown: ' + hits + ' as good as the picks, p = ' + p.toFixed(3));
        }
        kit.onKey(function (k) { hl = k; cv.draw(); });

        // week by week
        var weeks = kit.el('div', { class: 'qs-weeks', role: 'group', 'aria-label': 'Weekly rebalances' });
        var panel = kit.el('div', { class: 'qs-weeks__panel', 'aria-live': 'polite' }, kit.el('p', { text: 'Nothing selected. Pick a week: a taller cell means the picks beat more of that week’s darts; ▲ marks a week above the median dart.' }));
        var cells = WEEKS.map(function (wk, n) {
          var above = wk[2] > wk[3], ht = 1 - wk[4] / 1e4;
          var b = kit.el('button', { type: 'button', class: 'qs-week' + (above ? ' is-above' : ''), 'aria-pressed': 'false',
            'aria-label': 'Week of ' + wk[0], style: { '--h': ht.toFixed(3) },
            on: { click: function () { pick(n); } } }, kit.el('span', { class: 'qs-week__bar' }), above ? kit.el('span', { class: 'qs-week__m', text: '▲' }) : null);
          weeks.appendChild(b);
          return b;
        });
        function pick(n) {
          var wk = WEEKS[n], names = wk[1].split(' ');
          cells.forEach(function (c, i) { c.setAttribute('aria-pressed', String(i === n)); });
          panel.textContent = '';
          panel.appendChild(kit.el('p', { class: 'qs-weeks__h', text: 'Week of ' + wk[0] + ' · rebalance ' + (n + 1) + ' of 50' }));
          panel.appendChild(kit.el('p', { text: 'Held: ' + names.join(', ') }));
          panel.appendChild(kit.el('p', { text: 'Picks ' + pct(wk[2] / 1e4, 2) + ' · median dart ' + pct(wk[3] / 1e4, 2) + ' · ' +
            (wk[4] / 100).toFixed(1) + '% of darts did at least as well' }));
          if (names.indexOf('GOOG') > -1 && names.indexOf('GOOGL') > -1) panel.appendChild(kit.el('p', { class: 'qs-weeks__warn', text: 'Holds both GOOG and GOOGL: one company, twice.' }));
        }
        host.appendChild(kit.el('p', { class: 'qs-weeks__k', text: 'Week by week: 50 rebalances' }));
        host.appendChild(weeks);
        host.appendChild(panel);
        out(); cv.draw();
      }
    }
  });
})();
