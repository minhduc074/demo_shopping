export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  sold: string;
  badge?: "Mall" | null;
}

export const flashSaleProducts: Product[] = [
  {
    id: "fs-1",
    name: "Smart Watch Pro",
    price: 29.9,
    discount: 45,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHJQ8qfxI1dTXYkcr15rAYpIh2_9XMlUWksBui1QWhrOn8UGUAhzIrgvaviTBvJS72srhW-a4YhEsW4v8552EEJOXZgJQNz9WnRXyl1FiQPQaQWr975NF0Q8kq9-Ze3eEMp1APSclMkO1iT2s31dKg8uZizXmPxckJ7zexPGlGv7m6itp23v3MkiSUkPnAZqh4xpMZTKss_rfMkjLcSAyu6GxIfkwREseiBTSdVpmqfB8mBSGSprDxuSNd7akj5sh08UMixmnTVho",
    sold: "24 Sold",
  },
  {
    id: "fs-2",
    name: "Bluetooth Speaker",
    price: 15.5,
    discount: 30,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7GYE6EIPPuH3UhP6sRXn5oKE3vzhfKObWLCK8Nj_U_QPd_PcGAgaerKhbb_iUf02K46c4UGyrTyAG81mIXLq7C4_WYKpi8rqK2Bu6dEXhzHBJ2fxKe__0wwa0byAtAUKDcn4uKLpymCFOkt5Rf11bnaJx1L6iqDnOL7b3IG2c481Aryb7e-L63S_w_FeqD5jw8NQCxsPrxXtYXxbfJkZ-vK_vCh6mf9pCuCMbc15XA5C1RyX_IO9HKnOoTk-beh-AytVTf4-rxls",
    sold: "12 Sold",
  },
  {
    id: "fs-3",
    name: "Makeup Brush Set",
    price: 12.0,
    discount: 60,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAup-4DRY5GgJsugqh1Aa-MsF8K2OK5iIFZB98_Fiq-x_o9vvskSQiGvsuHykJL769ExBGPIr8c4qgfPW0CtepeffcAX6F6Nu_7zajLVxj1vuz5g75xEGrOMUKOW6dAJ6onbA9bMwVPGQ9wgXU4sUohtm5TFH21dOnux7Iguyff1A6hvv71XWUfSyP-IrnrXANQZ4mg4OFKHcdt_ThncLKGLuhOdAvMW2RwivnpObOxJhUMkb8U2O-OeeFDAb-inCr0Q9RRva0p4Oo",
    sold: "48 Sold",
  },
  {
    id: "fs-4",
    name: "Ergonomic Mouse",
    price: 45.0,
    discount: 25,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCI9Rn8rCDjjQf4SllsnaYWn-Mf-psGodfhXPLvljU_dssZZfWgUCn3yGSu8-dloFPR0cXSk0KhMvEqagIr7DAked4_gDYyKfbjQ1UVDcNJFNle1fRvjIYBTp7iTNCzCwKMLtjRw7JrC3ZcvjW_Qe8r0bSeMzLfcjr2mfON9mqGZh54cnGrxujC1LdX8Tq3wFmw8TAxR1sDSs8K8bT3MAIMAlr0zqgxzMiNaTb3wUg6yLpBd7bXawnbyVCOGbFHDo0nB1PZjHnVMAI",
    sold: "5 Sold",
  },
  {
    id: "fs-5",
    name: "Retro Sunglasses",
    price: 8.9,
    discount: 50,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5guLpGhlt31ZTwvd7y-N9I3UEk7AK-ql3VGGxQJvh02aA3nsM1ET_F0SwoJ58PcHiy3tNhYNmeJA6CZ5qItLPtZ9txgNpOhdpn65ZTl7S0gnaD922fjvAevw6rGFMIr8m0o57IaSJaEiecroZR4aSicPanqA5P1qgd--Trv9VfRjJBcArTOLPXu4RqDGvxhBT4QhWPOhWtmYrFwQ1OMdviSfLUCFSbrOM5VGn1la1pu8aFcZz1ai2k5wdhDZ_9-qIsi1EXEpkfqE",
    sold: "SOLD OUT",
  },
  {
    id: "fs-6",
    name: "Insulated Bottle",
    price: 18.2,
    discount: 15,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-tCn85LMVYQWmKD23uU6iT0ePwUq6bQAGQXRXIAzJTFX08Llym72m1kD5d8cdTQU3DcmbkYsxeLADm6A6ze6Ik4agfamNOTvFJZ7wAlIDCzQxrpyHLpuE9w5HVUOEg_lvddjgEZAowh3y24C0YB1SUVZghU9WNRwug7TzLmSFEi5iKi5MqPXseL623zATG6QAuCGJsJ9mihlUdr-8q0EYIRm7eXBmg43CEz8fr7UDP3c0pNxV7CU02l5e_tgM0YxTekkfTrGnX_M",
    sold: "31 Sold",
  },
];

export const dailyProducts: Product[] = [
  {
    id: "dp-1",
    name: "Premium Oversized Cotton T-Shirt - Breathable Summer Wear for Men & Women",
    price: 12.5,
    discount: 20,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgHATCHG-fSOx9uXNdS47mncdyTcyO5DLIpZ28nSb8dIrR7HsK16zRwaYn7u2JQUifkvcVh3M-zIbNYmpVWrD19yDcfC3nR0QoKrhxqFBL-uc0I-wxGxUTXkr5Vfk95eyCMAtdxO4fuaC1Om9bJSZiTPD0yiKWVIRIgnomXBQ0n5B-2qU0lDI55th-9bnpdrxyqIYd_R5fBRXbEhdiDW7w8SAP38gP3XjXVB4lB1QzZz_6Q4CriaJYM04PFfErR2hU2LO-r2SS01s",
    sold: "Sold 1.2k",
    badge: "Mall",
  },
  {
    id: "dp-2",
    name: "HydroBoost Facial Moisturizer 50ml - 24H Intense Hydration for Sensitive Skin",
    price: 24.0,
    discount: 50,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7_jKXJCpOlv8trfBmVGI8PYnfDwqOaNeodrGdUspAPKGkmqfzdZBHlBOCYAMmTWNZTwcJ0J8D2WJdZDWVgA4XYr2V0Iwiu0EH3CrhX75eVTcm0JXTIEk87tnKkuhl-rZxM1fySCLKdYC4TSA0CmxVPQfgS0TLugIzNpK7uiCY8EvPVSzzkfq0hymACO0xtPgpxYdaAGaAv6oP1tEBAmk0yQOZhJCz_3BmvKveRicoBRsrE8QAcY1Adbr7oFenDqjHE0HQTGf3H1w",
    sold: "Sold 856",
  },
  {
    id: "dp-3",
    name: "Razer DeathVibe Gaming Mouse - 16000 DPI Optical Sensor with RGB Lighting",
    price: 59.9,
    discount: 15,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBF-7FLjtwD7-TFF1AiD3NZXnPmrWLaWNNRRRxvpRZWr_zZH5RwH1MYFjHlcAChhw0E-Al4FZXWnTHY21jkFuEolZ-rwY6U6D6LmT8waRlY9bna_IASRDAyHNJvu_PKMKYehZXN4ql6LkFCBAyMC_vvNlrYGBQn6fT1ImsxC4lW2MkZQPb4h-cA7ryKQNASoACg1tLYvU8CMRAC9sgTSd0a0VcZf2IzSZnipz33Pnk3PPgiSTUnRzuGNPtQ-jlUQuLnEH7pbaNq2F8",
    sold: "Sold 3.4k",
  },
  {
    id: "dp-4",
    name: "Eco-Friendly Non-Slip Yoga Mat - 6mm Thick TPE Cushion for Exercise & Pilates",
    price: 19.99,
    discount: 30,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEh7nbiFRuG3QEqBB0Ig7LvzMAkOv1_LlupVzKRoaNo_2_nsnMrFmMppGms1ZYIBnhs2KUGqEny7BBEytTRNpLyZtP8_IynSYSuPMYSeqI5ckP9pGrWLqo0F8A_LPs7C_bmaZ-Prh8laVeHSi-JhI_O3-qeDFduEXHPxqkbuPAjs_ZuO-B3hQRYXPQET4ul4Vgwy0lxDGW_JBVlW-S9Rd2vrTqyljm_w_ZL_NmoV4LsP__S4sgfEZPHI8MHGWsKAS7lFlmiI-vqwg",
    sold: "Sold 121",
    badge: "Mall",
  },
  {
    id: "dp-5",
    name: "Barista Grade Pour-Over Coffee Dripper Set - Manual Brewer with Steel Mesh Filter",
    price: 35.0,
    discount: 10,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8E9373tyqb7mSTNCWWne81S6xtFrn3_KHSlEpE-UH9LH5LLRJnhpnrEAlTiTTrwnvHVx1wUtiRUcCofemhXWRxLoOm69KyRawIuMkT1N1uPkJ0R4wdtyCJSQloBqE3qicgQzqqe-wM--5JRNvdAg0_mDY1faJSRp8OUePaIMdfe2J5tdx_xnsKFouhss8zOPA_twKdXGpTUeS0KgNv0xfwIZZOcqy03e1sEyhYhgtIdF2k2oMos8I2VtdFV995XXWoxYAqbVuS0w",
    sold: "Sold 2.1k",
  },
  {
    id: "dp-6",
    name: "Heavy Duty Canvas Tote Bag - Eco-Friendly Shopping Bag with Reinforced Handles",
    price: 5.5,
    discount: 40,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRTCnaNXYtWwsBpfps-kZzYYI8pIFIkJF9xqQsy3DrmbBZ0OLmZknBzVXgN3Z-SGOojy0IB_d2EM7rxPhUHM1eDdYwnDjd62ZDjblKTdpGCXemqFrwePy48ikCdAeoSbjHhbD-yPCnIPUtnNFJmyUUapN1VxF184qPYxmUL64l2js7iTHPCCKC2qcI9lLcacxcpC_qWgEETSG53b3IewBHbmyiTmQlJydb1gsBOnRgZeTVBVXSwvuS-YBADHBOkXcjkYpNCWvy0zY",
    sold: "Sold 5.7k",
  },
  {
    id: "dp-7",
    name: "Smart LED Desk Lamp - Eye-Care Technology with 5 Color Modes & USB Charging",
    price: 18.9,
    discount: 65,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5rkcY1BPb3OpM49ryASJHSy6gcJ7RGkpNo39KlSJZlv0anJwCrZBDZPeOqWaiIII6IGdsMxGAtLwdcJS7axYMAOTog3JyX6AjQHIEr3eLbA_2ikC0cKYNttDwolrFx6P6USR6zKDBher4E6cuMSLI14UWy4atC9pXzhmqaY4n6gmNEwkMBxilchE_P6_weX3QV73PdvR0NjUOnOJE693_NfNQA_BbHeByu2DZFPFTc_6p_Su9bB1-ZJYXUR_F0TVsZGHE_I6AWQ4",
    sold: "Sold 432",
  },
  {
    id: "dp-8",
    name: "Organic Soy Wax Scented Candle - Lavender & Bergamot Essential Oils for Relaxation",
    price: 14.5,
    discount: 25,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDOPAL4Dfy2FHc8zYxFVgnDDzs_xxtn-aZYU2G3OQUvUcTRJwLCEOIW7l6lbBfC_cyNN4A1FfPFdwLE1uxwYioxWACY8i1Nw58dRaogFPyRmTUClD3omHXXM-Fqc70YFxVa_PnMnv-FapWNFQhv655mO5bixJ_pWHM_8ylFK_OFLRe2MBspMOoT9-M_QpqxKWc9J0sWv-YDu7tZ0MbPnWNP7AcMjYn1MJN1qw-sPij3uqFWtAz1jPkv5ekbh8LDg2lE_kihsnO90iA",
    sold: "Sold 1.9k",
    badge: "Mall",
  },
  {
    id: "dp-9",
    name: "Ultra-Thin Liquid Silicone Case for iPhone 15/14/13 Series - Soft Touch & Drop Protection",
    price: 2.99,
    discount: 80,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlL4IhJnEO4iIUCHEARlmkHdCPj-lwb4NUSQX3VnWXeMY_KjvRca5LBFzuNRgV3UAFjSjIIeaLC2ShDjC-aVTMp1DP9mo4Jf7ip0f3upLHHJMLVl4B5vMKassV0KdpLeVNuhm739y4vVssajd6UYqfiwgA1MirNwpVlIpsg1su57Vhx4UhAr8kD2eE3XYAxgNPKdiePWgYMknxCw_Qg_ipfk9Nf8o_zNzyTGFI7qAQuhvaMfLFr_OJsMGGrey2P4vEYsAim3islL4",
    sold: "Sold 15k+",
  },
  {
    id: "dp-10",
    name: "Premium Dotted Journal - 160 GSM Ink-Proof Paper for Bullet Journaling & Sketching",
    price: 16.0,
    discount: 15,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3VsJb980o877lMMtNoy3KWeWsJF5q5zud77xH87pFRbWPrvYPy-a3zA0Q-o9dc5Pv7k8OMi-HJtz5rE2DmDGMm2x1T2kvzs4tnvsC9lqX8Osi5oz23Yjo5QRtS8PrtrbmioLz3WA3HY9uipc8BzuAZmKz5NjoqhGaa7_beSq9OsPzMq6IbVEWykpsL5woNx0RV3qY4eIhm3qyX0ElGOmu_GIF9kTZoefrNBw8FRo71drNycudfOgyOIfLT6877sWj2fZXpD3EHZs",
    sold: "Sold 642",
  },
  {
    id: "dp-11",
    name: "Motivational Water Bottle 1L - BPA-Free Tritan Plastic with Straw & Time Marker",
    price: 9.5,
    discount: 45,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD6KI9GilgmZ9HqCHN4a_6wsB50i8mcEOkLxo02jbk3-_NhGSg99TN5X2yfH-weQ1Oh3d3Yx1wvTe6z7GbpuPyACmeda7Pcx1xeNVUTtEOe3KqYikzOfRZR4yI-PDjie3EiVhmfRE5LF5IWK0bziiKAlYEB-IdgCg-u9NSwhrxAL4PcbLVIDXKlHLuBxsjChSBDNB92hOEIPJiAYl16USL-w1r1isT53i5N4Dd65_lQHGyIkddpNTNvrBualGjMZ7LycKlIHDe2HvA",
    sold: "Sold 2.8k",
  },
  {
    id: "dp-12",
    name: "Cat-Eye Polarized Sunglasses for Women - UV400 Protection Stylish Summer Eyewear",
    price: 11.2,
    discount: 30,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDN87nxS2MQTKAMf7H3o-bbHCSv32UorJZ_LV8kSCCwevzX51NAEo9piXm7VACj73jRvQIuD5CdM0qwAhUE1cvElgVorCiblmXrcfliqX5iQgq_ohwxZS9mCyV48445mz-xzLvIBumVzWNFelPivLcTGS7hsjaYfBYjGHhcRGr212Kd8iJu0HofbxKb4i6C0pTJxxlOxQpZr657NF2XJYBwMbI3vrUbzrnT-Iv-t-Ww2O4E9b199TZGB2bBIg_GBfiq2cB8tGzPjrA",
    sold: "Sold 3.1k",
  },
];
