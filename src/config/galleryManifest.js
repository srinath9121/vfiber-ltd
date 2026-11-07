// src/config/galleryManifest.js
// Safe URL-encoded manifest for all 7 physical fiber infrastructure gallery folders.
// Fixes EC-03: double-space folder names and 192-char filenames causing 404s on CDNs.
// Use encodeURI() so paths with spaces, dashes, and underscores resolve correctly.

const encode = (folder, file) =>
  encodeURI(`/${folder}/${file}`);

export const GALLERY_STAGES = [
  {
    id:      'submarine-cable',
    tab:     '01. Submarine Cable',
    label:   'Submarine Backbone',
    caption: 'High-capacity submarine fiber cables transmitting terabits of data across ocean floors — the backbone of international broadband connectivity.',
    images: [
      'D3bs8i9bno50gmG-iKFQD0ROYBt18OhGNvb40HhqTg1tIyzaVAoimXARST5a0Fs1amZspA4PdF54-i9dOiAcGgpx9TaUMnNfBMT-dg5qmKlVbPlssnFW24NoFgqeo4tsQy_xJiIbEZJe7pyEd6Zy-GQdXBBR3WyOuXa5x2asl1X6ThUgDhB8S-HVNOuj3Wx_.jpg',
      'HxAKTRXsyHbFh9dcfLu4YxJmB_6ti9KHPM9aOgKP8UKAulvLWnUUwP4nWrbUvxwGbswv2WPACphg9ZZHVM6EcJBU-TV6oWbrHhwfZqfwPGVFfASlftB-2ZE1kCdG_aNBCz3CIzgGb99QwlPVVrFyVst3PqBisyj_ZtQkVN9xF0dAKgvPOYoPIcfGDT5XfyrY.jpg',
      'HXmgH7etZOTCm18OFU5ni_yjRclUeLuzXwLeBGpl136XdUheF-TelveCRXzwJnxq4eIFMsQFqi48dQzd7c5Q262XwhkemoQPLHRXxbIxhFBBJ0v34Ff9upndTwipMn-4-64dzra1lxaNHB0StbRU7GZfdbKHI80SMF38pK3x6XwfoDvY5yaK8sXDKtEYS4K7.jpg',
      'RNtD_tgsjkfsCcDXLGY7A47aMlaOJ1C04jJPoW2MuEHjfiI21Pmh6g2oqcbA7k5kVCQym3Nx45qfZ9g6-IlR1lOc71tHojLj9wgPjjyU_nQDun_ogbE-UWjXSAQnYgFmBuu0ytbTqkvrMXxXlPEWYXEsL-mS8nEimktlyhAQH5qaz3HbRs4PhvNE1QcNk2ge.jpg',
      'TJRAKzTV50kAHMf1ingeU7zqkmeQDGZZTI241dJLtJ0EOG553UveHRmRNi8ZSURMhpq71wbDStQkegFt0Ab2oiB-57OyD_MhysCqGVbaXI439kzoXtQtXarWFrUcEsJXLsMOwg_eZsFyBawWSZnVJoq8M9fmzV6cVwQPBPWO0SqQ_WmUr2tF6i_MjZ4WUjY6.jpg',
      'XRNbyRtzA7p5iG3K6EaOj4gcVg5vQjrHsOgQX0B6uQvUMiBzmv5fRKntsBSTttU3cUK2Yrgs4iSPA2tfI0EF6PK9i3Tfs5-Bb5HHVaEeArB3MD5WuxCLWb5WoxG060RVRlc0_ZHBR31-XMGY7MV8iN19y7ZdSocQZl2elQUgvHsYPHcptrvzYJK4S7zh_MKC.jpg',
      'Zp6OW3nnJCWXlhCzq_SlYpYrT7vwCVsX5I57SDC3yD6I68WTJzeqUsH6_hHzKoEHlE5jFu52sADunhbjqiOO4li4p7dl7sqxNM3D8ioH9DMGMI3KC3XK--A-Pe6ZhqeRIk9i0V3srGy6V7KGYKp4FdowZEUYpCSG6WWcf2m8P7BLCqOBkriRqkstsMfzuUTv.jpg'
    ].map(f => encode('1. Submarine cable', f))
  },
  {
    id:      'loose-tube',
    tab:     '02. Loose-Tube Bundle',
    label:   'Loose-Tube Construction',
    caption: 'Actual fiber bundle cross-sections showing loose-tube construction — the industry-standard method protecting optical fiber strands inside a gel-filled protective sheath.',
    testId:  'gallery-tab-loose-tube',
    // EC-03 fix: double-space in folder name — encodeURI handles it correctly
    images: [
      '_nDYfb8rliF6urjpQBYFLIEyntKD0CEiUV3Pz5bM_kCCCLr_Lr1QXkQPVA35RmEwK2jSBIkc5V7V_z50EcFUGxTj-nMm_zFKbKzZiXRM4e9xz3vTYtGmLMZKRcGRBTxym0hYV7zNXJaGZCkvW9aZTk2KgMnusd-s34Kb2SEPixUl9NW5uJNeo13qOxBcZlL5.jpg',
      '90DkkpW45pcrPrL2-SgLMtC5eTahq4u1sV2MT3YREob-6hYb6ex4pswu7Gg1hyQ88Oo2De6uPzKHOy4gLng-USk6mUS_9O7x5GwMyj2QdvkaZOwVOnYS4kz2NbwCEYrdSbUK4M4Avyr2GbslNCL2T-Dhmc8pgucH4VcElpfiAL4AtmdlRgaQ2KAlTQHmOpX_.jpg',
      'en2IHhPeCRaohf1_KSYXHpdcnXK73FwjYYO_MsD1oRxur3MH82Z4eDt76LQTiBjxmrU8dLZmj8pSL-g5eAcskSrch19KyJHkhaGfgmeipb0B7QEb8SOoypHm-GOxRJEgHbL7QAK_fRsJX22pQYpxRiJYigU2FIM_19othvOyhu3Zi2FcZALVhJLFEny1iEY_.jpg',
      'HoD2uZtlMOOXysIhU3CNi5SAyQePio_JqADNqtA_f4wF-sSo9TTxQadIkl2wjYcGwNQG18f-yMZDC21AaGJlfIjYqagHIg77-Q483O0qEsicbppUTOLoM01IEwPNU6sWamvlPJvmjAKiBtC0-NNz5Z9AUnUiPqNFJ0LbA96n_evWly3mjkxNQ3hqGpDkstOd.jpg',
      'yNzUEnztBl0NjehKDqp-s5aOfJSor0IloUAEviYa4bidsU1OF_SrGajfgYSDZO0hLWTAkzo7JSt_BN8465me2FRXqbowAnnaN5ALCqDJ6mldZ0e-ElUMvniZ_rStasyx6XPwJWfndp_azrby9aKlMnx2XkZgVVkaHpg1-lpo4rrElBMt9b6F9wJBbcKLGAZS.jpg',
      'YZhsiXd5NpkTQaXgkjsEB0H0R1K3YReQm7_lABTvigTBC7STu00UPV8-qWNJUAx8bGfjlpP1H3kuDiqi8G7vw0JvLGLGzlVUcEocV9FzicAyoLPR5KzghTMSn7BE84l9oSnhqLuhRudCD7z6kk5nbWkjN8r1MwiTx_n6q-uq1MeSjUu_Va1IyPSW8dmoFTZM.jpg'
    ].map(f => encode('2. Actual fiber bundle  loose-tube construction', f))
  },
  {
    id:      'optical-fiber-macro',
    tab:     '03. Optical Fiber Macro',
    label:   'Individual Optical Fiber',
    caption: 'Extreme close-up of individual optical fiber strands — hair-thin glass threads that carry light pulses at the speed of fiber, forming the core of modern broadband networks.',
    images: [
      '_9LM94eoXcwAB_iZUbAWcKcwvoOfq8c701sTIoGgSEiv8uHsJh5ZK-Z8Xwu5EcQ4wyI6OWa0BTBNRsSDKqMtRZi-pe47lMT06k1fXBkBXQi-F-DckBB1Y_nKcqbPjDs3b--T1tkawdfSyMifOJ-yhpvWb5nhhsoQ1aCS0PoryCoxHjV4UcCq26tFw-kWm7xm.jpg',
      'JJWN9rWheoicbLQI6B5sa0-gnp9EI3cb9BJcsfjHHvo6zVItJS1m38ClaRaCFIXviIzGjhK09txU6cCYB7pkJWUOrcU-gYRT8LyDCpPUre-hbxIy6a1L1BoClvL-i-9UhguBmvpJpkxGBtk8bWv5C-EqnFaYMQ_8Tq5XOsXruwOdx3Zma7tsHebTqJH5822BD.jpg',
      'uvQdFG6gX0BsU-2WdapVlKznQGvJgGRASn9Cd6CFnRq9OyDVzwPB10QjlGFiMzQR6WpWBp3LSwehY2JKhP-6_kEO-n1LalePfPe8f7pTY1_mgXNAZaruAL-7Omb2z7tZ2dfylOd4oV4I-wzbn0k2Gb0_QBTiH-FR-nSa2d3fGx3h0U7D5uhz_bv0aIQVI-8w.jpg',
      'zwaxCKlUshlU3C8vmAoBfXqAUT3dwP07OKrXWHC1E-MA8YZtkyPR3UQQSYVUpoLOgL-FHgfkB9DYkJL4VgeCk4b2xKZxF6k7sFNXt1eMgj_o3vcOrB_3PllpLUIB794ObL3ARDfkpuOyrJzqkGMPJmArZEnUItAuZ_6Qdc-sMDyJlT14t1vFKmHpEKbIUFrp.jpg'
    ].map(f => encode('3. Individual optical fiber \u2014 extreme macro', f))
  },
  {
    id:      'ocean-floor',
    tab:     '04. Ocean Floor',
    label:   'Subsea Deployment',
    caption: 'Submarine cables resting on the ocean floor — engineered to withstand crushing pressure, marine abrasion, and deep-sea currents for decades.',
    images: [
      'ArfAC26OzHs2SK23dyZlBXrVgNDyPVQcrrd_Jd72hpXxnbBeC6EgmS_nYDpSUKgPVEjiuXEvqt01X2ZGvhVAegJkhiTCUyJw_taQruCEEr5xuLzpqhl0oUwghcnrrDWyIbNAUgbomOYZuDfvYm3M9gIaHEWCpDx7ALyKRDc_KG3Q971qjO5paw28HaNqD08i.jpg',
      'JBIZAjEJCAtbCAHfkAkS0npYFhYeJuynS0Wyl8T9Q3Sy-e5mhN5PYhvnXuvaSl4BAqqvQBBMqCP_xhcjCbhTGfTaQ_XL847zU-eVguCkv3rMLdDf1Jlaw5fwu2fIAliqLeLWvTCvZsPxc8Y7-DGxJBiMstw4Q1avvg0tNp3412U3L2O9MxzJl8I0AIFnPS6O.jpg',
      'OIBCEPjw_EyyZpjSwJi-mKt2voi1y7zG_YFjr7Q3XGij7fYZcAL6pk47jTet2EjuQz-JqYY3c1kyy5yvfWAxSm9x1pJxwsB1zhXZOWY_qyZkkiIsDHfWwku2f7st2ibiNs38pxrUWcGs5-8gFyydDCGlqeSh62QkLnFos5igA-xVCKQRgrGtM9ibT4wiRmqi.jpg'
    ].map(f => encode('4. Submarine cable on ocean floor', f))
  },
  {
    id:      'cable-landing',
    tab:     '05. Cable Landing Station',
    label:   'Cable Landing Station',
    caption: 'Cable landing stations — where submarine fiber systems transition to terrestrial networks, housing the amplifiers, repeaters, and routing equipment for intercontinental connectivity.',
    images: [
      '6vvddEUaHIYY2pEWHpktQs-2B8MTugKNpqLP_gYNi9X1hH4jByaBEoFOTPHBcQ-mF6_a8466Hkeb8L2jkUY6jkkFVM9trjVVbIJcQMExZ-7L9ULLLEMkEaTAnU2NIck9_6g_v70yTCPJZF_SadjZUYhK_XO81Z9U-fognxoV86IhgNQU68ogmsf5vcQDTvhz.jpg',
      'ChNUzl_h6FFOQCkizLS4HAE8m8-CsA11S60SmUoJGKVZJ434WqHPBBsmwkAKzaXr02EjjpJYFA-jUWTGsuKl75COoA8WmqKquic2o-Ul9jGk7rSCgN6Qm1Exew2MrWKpCN4y4bW4qpjASWSgDYuAZKLd57YMTl66hQQhEpkepLs.jpg',
      'DkaMdP-Y4DsusrFrtU54g7jUcgMwxs-oU1yAUvzUhONKydfu371TrS39ODrkiXtAkp5hj5EzWugyrTbmP_ZuB-qt1Lai-dH0LEUNIb-vC5vNAi3Nx1v2xppr4nAMJlW2Y_3Zav8njlyXXuaJbgckuZr3fvkR1zQhi5Y78MtYt0Q.jpg',
      'eJRW1NMwqFz6aTzeQbtQ0bWUkm7mFhY6VFxI9a2F3VifbGwgqn1qXgy1OTu7B5nFwnMyaXI1wEWP3DDVlMLMhAiGd5Ddq5WINXt7KQXocumRljTc_nSpdnteX4861e8UcEzU3i01csLjjtSh-gkK6972qHU9TPYpCCrGzlxhdPgozc0OhHqqjvL64ZPMqDvj.jpg',
      'Z1CiaruvYADTJt05vUKlQyQ2lYhCT_25TwH2aLFNnisbWgjzOpb2vX_SMDXCyCafmcb2lln0Flc6jSr5Ral5oE1F_hft5hidaVfVUnwENi86G4K4f4m3ROgImJKXrrtzClWi16k9IACiIcFBjy0sBknRo0HHnnilESSW9Bk0Q7c.jpg'
    ].map(f => encode('5. Cable landing station', f))
  },
  {
    id:      'splice-closure',
    tab:     '06. Splice Closure',
    label:   'Fiber Splice Closure',
    caption: 'Fiber splice closure hardware — precision-sealed enclosures protecting fusion-spliced optical fiber joints in aerial and underground deployments.',
    images: [
      '-ew6hI_rI1rDEaS8VTkVx7RH6syYlLIo3C30UjjuJWAKSEmPEl1n7gvEfz774Ybik2kh-QpiJSA0sZtXYLVAFu8w8dGCoWaWo4TZwSiDCA6nuyT1IBikrOhGvaUraQLMZDYfVdF4UcbXrBmBO5w8DFpmuZ8SnfAKIS5vpQwhEXPb5y9JMzjYCDsQGuL12-N4.jpg',
      '0QewIYKU19taTPRFFbLw5CHlQYvKPDHrHCDp0yMbh3yiOHHPafaXIF5U9oiU6kiHVTp1GE_go0h8L-hZzRG_GbOGY1f-oGMjOwqvTybCjkOmWNMObFxN6mfEfnzM8ikBQRClNa1CU7NJKgGZ1gEeLzu6dCBI8uH5GzFPCcZLPDkhmxj1zOI1_VQj-Ccz1duK.jpg',
      '3T1D36PCnh25xhAF4gVbENIWFkjznmO2-W5YY2lcyJF3w0v8qmxdYH97WKImdPL2U9wyz3LqbJ_HTd_vKhWzLpBfvbnBPlN5KIyE97j5fr7eZH-oYqazGrqRY9b28Il-ECXgb0rjxJYn59O7X6guGOquPpHl3l2uxDl29dAbCzOogQeB8qQmPbxRTXCjW7hF.jpg',
      'TsIHfinH8pVXDbM8CqSGJ3IhskILf7o-59YAy-HtMh06GO9S7sGkLVoIpJEy_1duVKLYldxQ6mBk9v5hX6Ya6XnGxcWQzAc9itnd0EXM_-9RgMgEo1-7cfWOZ_VcLRA8TJWD20RdW3yGttGK9KdQqLx0cjwzuRS8KKRF9hDEHukVnZEvsQ2Ithf4iZpR2LPN.jpg',
      'wmxGClpFIqE46yuPVNgU4oqcaNNhC-xVw7atSORk5_t_rJf5NBSVixpSGgrjCZpZaHn6pi3hHkxfm3V3UFIwTR1wbWzv1MfsoH6PedO9KwbHPqkCEllLJAehxy4p7xog-K__wHO7xxXehQyNnMN-FrYJqKD2OqkenFZHnIn_kHQ.jpg'
    ].map(f => encode('6. Fiber splice closure', f))
  },
  {
    id:      'odf-panel',
    tab:     '07. ODF Distribution Panel',
    label:   'ODF Distribution Panel',
    caption: 'Optical Distribution Frame (ODF) panels — the demarcation points that organize and route fiber strands between backbone networks and subscriber drop connections.',
    images: [
      '71pLpvp1VOUtNZ6Ka4DGebADwGLpFQi-3-w886Wm6GsXtxTclZC26q0vqhtCZrcglNVf-ggnRtl_Hzms5eJhrXoFMh955SqL8Wj6xqHFRZqsXg9mjdKt40sY9ErMnaugbh34-yRsHLZkTIN7tKhsVnXMqFtVdqm8_AlmXfXRwb_jlRtYQEJigm1raMf4kwrU.jpg',
      'fUv6DjNAphc-m_f6U-o5YM49_NQWqtj0JoswXO8d35Jz9GIx8GH1bIlGGnG79DGvLjk7JRR4PRZ7qGxoiQVjLgQ9V_i_GHRoNiIuNRD5FCyvXbYjY1FC2x5h4K_3JYsfFmVoCwPG5mWUd_x8N2lihNKDkJuFqLInBwvHdeyOg0PjccstV8RmruT97Y5GLDvm.jpg',
      'Glyg4L7EmZ6chtKRzc3vJSi1GmEGNpNEHDF89rRLQBzK0OlEZDkbezqxpQD96Y7KI7se7Nb3LlsO7JgW6WXNZELdxzhmtEdLm1cwWCCsxewQqXckSdNSQSy3AgZxfyFb4hll6lHqIkwG35aNexH3ptrnQOrq9xm4HgiETWh360KkrOLtIPF-2PtfsmfIg8Wi.jpg',
      'hFTHZ1JqSwKTYHAdHknVtzoZWQccqUfEK2RdT7QEAznc-p8I3OzdOY7XsVb-5WpnoMwOqZrOKzdpnf5xSNWtmczTm27VhwHu8Zgv1iHwWN-gYncMp45dcOHu3U6g-oxGngGR53dPF_A5WTfsVayIUaRpy_6sQ4ah8fSoQK_YfyKAEjlJuJXPV1meUnFXIWb-.jpg',
      'mxdO3qX2ojTXpYiod33-_f8R-Fp4zp-FRxuK-rjbt2Lk-Ti3AOAnDaydcrqwN7QaMA_HWumsnm3bvlWy9n6JjwKf5NOiuKSNWSGCX91L-J2FON1OhobGgTCxBczCkGCjg3tzDP7beddyaEh36PMQdpcUGNeX7OSTtwDcatMCP-lvfBOgEVYFC2Rab_Owghx2.jpg',
      'sB_ehBWLQMdwlSyTfhxIxOkiqZZMo07U-ZqKI8TzPf_FoHXMr74CAPf-qCfx77-prbRHy5A5uedvPRlOJ8L_1EDFIMfcdorWLrQbf2FAnj6DIAMLT9fTrnYNGSvZyv4AiSTZsl4QVgBlwBhTSb-id2jFu6R83CU0KqR9rGaZLsEFq8xMVsCUwVa4H56AgX9i.jpg',
      'SPsTPq31yPchkLSl8e5J9AT0Iam_Up5prjBJOVmcbf21bpH5zZvhLHc7vg9-PDXsmal_YJa1tjqUcscjXH6DulBZ5xZNN02c_mx37HnPwDlgi2jNaaJGOPWl08kHHev71ES3jncN2--mGkwMwIVLM3NnIoRhqB_auqzCH3qwf6HMa1jXLCUcXeSgKzf43bhH.jpg'
    ].map(f => encode('7. ODF  fiber distribution panel', f))
  }
];

