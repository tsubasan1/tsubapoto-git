'use strict';

{
    const btn = document.getElementById('btn');

    btn.addEventListener('click',() => {
        const results = ['大吉','中吉','吉','末吉','凶','大凶']
        // // const n = Math.floor(Math.random() * results.length);
        // // btn.textContent = results[n];
        //上記2文のまとめ
        btn.textContent = results[Math.floor(Math.random() * results.length)];
        
        // 確率操作
        // const n = Math.random();
        // if(n < 0.05){
        //     btn.textContent = '大吉';//5%
        // }else if (n < 0.2){
        //     btn.textContent = '中吉';//15%
        // }else{
        //     btn.textContent = '凶';//80%
        // }
        
        // switch(n){
        //     case 0:
        //         btn.textContent = '大吉';
        //         break;
        //     case 1:
        //         btn.textContent = '小吉';
        //         break;
        //     case 2:
        //         btn.textContent = '吉';
        //         break;
        // }
    });
}

