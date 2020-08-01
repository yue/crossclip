# CrossClip

Sync clipboard across macOS/Linux/Windows.

Written in Node.js, with native UI powered by [the Yue library](https://github.com/yue/yue).

## How to use

* Download the software from [Releases page](https://github.com/yue/crossclip/releases).
* You will be asked to fill some information on first run, you should at least
  change "channel" and "key" to unique strings.
* Repeat on your other computers, and make sure the port/channel/key are same.

<img width="685" src="https://user-images.githubusercontent.com/639601/89036101-0c59c480-d377-11ea-9e2c-43f58f3f45ff.png">

## Notes

* Only plain text are synchronized, there is currently no plan to implement file
  copy/paste.
* The network part is implemented by broadcasting messages, so large text in
  clipboard would fail to be sent. There is plan to rewrite the network code
  with a proper P2P library to support sending large text.

## Contributions

I do not plan to spend too much time maintaining this project, so if you want to
add a major new feature, I would suggest forking this project instead of sending
a pull request, and I would be very happy to add a link to your fork here.

Bug reports and fixes would still be very much appreciated.

## Icon

The [application's icon](https://www.iconfinder.com/icons/2530830)
is designed by [BomSymbols](https://www.iconfinder.com/korawan_m).
