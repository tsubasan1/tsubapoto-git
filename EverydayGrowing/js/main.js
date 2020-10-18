// 現在ログインしているユーザID
let currentUID;

let dbdata = {};

// 投稿の表示用のdiv（jQueryオブジェクト）を作って返す
const createmessageDiv = (messageId, messageData) => {
    // HTML内のテンプレートからコピーを作成する
    const $tableTag = $(`<tr>
        <td class="message-item__date"></td>
        <td class="message-item__text"></td>
        <td><button class="btn btn-danger toukou-item__delete">削除</button></td>
      </tr>`);
    
    // 投稿日付を表示する
    $tableTag.find('.message-item__date').text(messageData.date);
    
    // 投稿内容を表示する
    $tableTag.find('.message-item__text').text(messageData.text);

    // id属性をセット
    $tableTag.attr('id', `message-id-${messageId}`);

    // 削除ボタンのイベントハンドラを登録
    const $deleteButton = $tableTag.find('.toukou-item__delete');
    $deleteButton.on('click', () => {
        deletemessage(messageId);
    });

    console.log($tableTag);
    return $tableTag;
};

// 投稿一覧画面内の投稿データをクリア
const resettoukouView = () => {
    $('#toukou-list').empty();
};

// 投稿一覧画面に投稿データを表示する
const addmessage = (messageId, messageData) => {
    const $tdTag = createmessageDiv(messageId, messageData);
    $tdTag.prependTo('#toukou-list');
};

// 投稿一覧画面の初期化、イベントハンドラ登録処理
const loadtoukouView = () => {
    resettoukouView();

    // 投稿データを取得
    const messagesRef = firebase
        .database()
        .ref('messages')
        .orderByChild('createdAt');

    // 投稿データのuidを取得
    const messageuidRef = firebase
        .database()
        .ref('messages')
        .orderByChild('createdAt');

    // 過去に登録したイベントハンドラを削除
    messagesRef.off('child_removed');
    messagesRef.off('child_added');

    // messages の child_removedイベントハンドラを登録
    // （データベースから投稿が削除されたときの処理）
    messagesRef.on('child_removed', (messageSnapshot) => {
        const messageId = messageSnapshot.key;
        const $message = $(`#message-id-${messageId}`);
        // TODO: 投稿一覧画面から該当の投稿データを削除する
        $message.remove();
    });

    // messages の child_addedイベントハンドラを登録
    // （データベースに投稿が追加保存されたときの処理）
    messagesRef.on('child_added', (messageSnapshot) => {
        const messageId = messageSnapshot.key;
        const messageData = messageSnapshot.val();
        console.log(currentUID)
        console.log(messageData.uid)
        if(currentUID === messageData.uid){
            addmessage(messageId, messageData);
            
        }

        // 投稿一覧画面に投稿データを表示する
    });
};


/**
 * --------------
 * 投稿画面関連
 * --------------
 */

$('#comment-form').on('submit', (e) => {
    const todayForm = $('#today');
    const today = todayForm.val();
    const commentForm = $('#comment-form__text');
    const comment = commentForm.val();


    e.preventDefault();

    if (comment === '') {
        return;
    }
    commentForm.val('');

    // 成長を投稿する
    const message = {
        uid: currentUID,
        date: today,
        text: comment,
        time: firebase.database.ServerValue.TIMESTAMP,
    };
    firebase
        .database()
        .ref(`messages`)
        .push(message);
});

// Realtime Database の books から投稿を削除する
const deletemessage = (messageId) => {
    // TODO: books から該当の投稿データを削除
    firebase
        .database()
        .ref('messages')
        .child(messageId)
        .remove()
};

/**
 * ----------------------
 * すべての画面共通で使う関数
 * ----------------------
 */

// ビュー（画面）を変更する
const showView = (id) => {
    $('.view').hide();
    $(`#${id}`).fadeIn();

    if (id === 'toukou') {
        loadtoukouView();
    }
};

/**
 * -------------------------
 * ログイン・ログアウト関連の関数
 * -------------------------
 */

// ログインフォームを初期状態に戻す
const resetLoginForm = () => {
    $('#login-form > .form-group').removeClass('has-error');
    $('#login__help').hide();
    $('#login__submit-button')
        .prop('disabled', false)
        .text('ログイン');
};

// ログインした直後に呼ばれる
const onLogin = () => {
    console.log('ログイン完了');

    // チャット画面を表示
    showView('toukou');
};

// ログアウトした直後に呼ばれる
const onLogout = () => {
    firebase
        .database()
        .ref('users')
        .off('value');
    dbdata = {};
    showView('login');
};


// ユーザ作成のときパスワードが弱すぎる場合に呼ばれる
const onWeakPassword = () => {
    resetLoginForm();
    $('#login__password').addClass('has-error');
    $('#login__help')
        .text('6文字以上のパスワードを入力してください')
        .fadeIn();
};

// ログインのときパスワードが間違っている場合に呼ばれる
const onWrongPassword = () => {
    resetLoginForm();
    $('#login__password').addClass('has-error');
    $('#login__help')
        .text('正しいパスワードを入力してください')
        .fadeIn();
};

// ログインのとき試行回数が多すぎてブロックされている場合に呼ばれる
const onTooManyRequests = () => {
    resetLoginForm();
    $('#login__submit-button').prop('disabled', true);
    $('#login__help')
        .text('試行回数が多すぎます。後ほどお試しください。')
        .fadeIn();
};

// ログインのときメールアドレスの形式が正しくない場合に呼ばれる
const onInvalidEmail = () => {
    resetLoginForm();
    $('#login__email').addClass('has-error');
    $('#login__help')
        .text('メールアドレスを正しく入力してください')
        .fadeIn();
};

// その他のログインエラーの場合に呼ばれる
const onOtherLoginError = () => {
    resetLoginForm();
    $('#login__help')
        .text('ログインに失敗しました')
        .fadeIn();
};

/**
 * ---------------------------------------
 * 以下、コールバックやイベントハンドラの登録と、
 * ページ読み込みが完了したタイミングで行うDOM操作
 * ---------------------------------------
 */

/**
 * --------------------
 * ログイン・ログアウト関連
 * --------------------
 */

// ユーザ作成に失敗したことをユーザに通知する
const catchErrorOnCreateUser = (error) => {
    // 作成失敗
    console.error('ユーザ作成に失敗:', error);
    if (error.code === 'auth/weak-password') {
        onWeakPassword();
    }
    else {
        // その他のエラー
        onOtherLoginError(error);
    }
};

// ログインに失敗したことをユーザーに通知する
const catchErrorOnSignIn = (error) => {
    if (error.code === 'auth/wrong-password') {
        // パスワードの間違い
        onWrongPassword();
    }
    else if (error.code === 'auth/too-many-requests') {
        // 試行回数多すぎてブロック中
        onTooManyRequests();
    }
    else if (error.code === 'auth/invalid-email') {
        // メールアドレスの形式がおかしい
        onInvalidEmail();
    }
    else {
        // その他のエラー
        onOtherLoginError(error);
    }
};

// ログイン状態の変化を監視する
firebase.auth().onAuthStateChanged((user) => {
    // ログイン状態が変化した

    if (user) {
        // ログイン済
        currentUID = user.uid;
        onLogin();
        console.log(currentUID)
        console.log(user.uid)
    }
    else {
        // 未ログイン
        onLogout();
    }
});

// ログインフォームが送信されたらログインする
$('#login-form').on('submit', (e) => {
    e.preventDefault();

    // フォームを初期状態に戻す
    resetLoginForm();

    // ログインボタンを��せないようにする
    $('#login__submit-button')
        .prop('disabled', true)
        .text('送信中…');

    const email = $('#login-email').val();
    const password = $('#login-password').val();

    /**
     * ログインを試みて該当ユーザが存在しない場合は新規作成する
     * まずはログインを試みる
     */
    firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .catch((error) => {
            console.log('ログイン失敗:', error);
            if (error.code === 'auth/user-not-found') {
                // 該当ユーザが存在しない場合は新規作成する
                firebase
                    .auth()
                    .createUserWithEmailAndPassword(email, password)
                    .then(() => {
                        // 作成成功
                        console.log('ユーザを作成しました');
                    })
                    .catch(catchErrorOnCreateUser);
            }
            else {
                catchErrorOnSignIn(error);
            }
        });
});

// ログアウトがクリックされたらログアウトする
$('#logout__link').on('click', (e) => {
    e.preventDefault();

    firebase
        .auth()
        .signOut()
        .then(() => {
            // ログアウト成功
            window.location.hash = '';
        })
        .catch((error) => {
            console.error('ログアウトに失敗:', error);
        });
});