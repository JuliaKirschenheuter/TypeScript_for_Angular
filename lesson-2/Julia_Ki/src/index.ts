// @ts-ignore
import { combineLatest, from, fromEvent, interval, merge, Observable, of, Subscriber, zip } from 'rxjs';
// @ts-ignore
import { catchError, filter, map, retry, skip, take, tap } from 'rxjs/operators';

// from создает стандартный объект Observable и перебирает переданные эл-ты
// from - конечный

// const sequence$: Observable<number[] | number> = from ([1,2,3,4]);
//
// sequence$.subscribe(
//     (value) => console.log(value),
//     () => {},
//     () => {
//     console.log('completed');
// });


// // --------------------------
//
// // создаем наш объект типа Observable и задаем ему конструктор. Здесь создается поток
// // по сути здесь создается бесконечный поток
// let count: number = 0; // count снаружи - второй поток будет горячим
// const sequence1$: Observable<number> = Observable.create((subscriber: Subscriber<number>) => {
//
//     setInterval(() => {
//         count++;
//         // if (count > 9) {
//         //     subscriber.complete(); // если вот этого complete не будет, то поток будет бесконечный
//         // }
//         subscriber.next(count);
//     }, 1000);
// });

// sequence1$.subscribe(
//     (value: number) => {
//         console.log('subscribe 1 ----> ', value);
//     },
//     () => {},
//     () => {
//         console.log('complete');
//     });

// // второй подписчик получает данные с самого начала, те он будет холодным
// // (если только count находится внутри нашего Observable)
// setTimeout( () => {
//     sequence1$.subscribe(
//         (value: number) => {
//             console.log('subscribe 2 ----> ', value);
//         },
//         () => {},
//         () => {
//             console.log('complete');
//         });
// }, 3000);


// -----------------
// of - конечный. он переберет все значения и закончится
//
// const sequence2$: Observable<number[] | number> = of([1,2,3,4], 1);
//
// sequence2$.subscribe((value: number[] | number) => {
//     console.log(value);
// }, () => {},
//     () => {
//     console.log('complete');
//     });
//

// ---------------
// fromEvent - бесконечный горячий
//
// const el: HTMLInputElement = document.querySelector('.live-search') as HTMLInputElement;
// const sequence3$: Observable<Event> = fromEvent(el, 'input');
//
// sequence3$.subscribe(
//     (event: Event) => {
//         console.log('subscribe 1 ----> ', (event.target as HTMLInputElement).value);
//     },
//     () => {},
//     () => {
//         console.log('complete'); // не сработает, тк поток fromEvent бесконечный
//     });
// //
// // // через 4 сек после запуска первого потока
// //
// // // при этом второй поток ничего не знает о первом, они не зависимы
// // // но значения получает с последнего значения нашего Observable - горячий
// setTimeout( () => {
//     sequence3$.subscribe(
//         (event: Event) => {
//             console.log('subscribe 2 ----> ', (event.target as HTMLInputElement).value);
//         });
// }, 4000);


// -----------------------
// RxJS == Lodash for Stream
// from - конечный
//
// const sequence4$: Observable<number> = from([1, 2, 3, 4]);
// // поток sequence4$ не будет затронут, если его сохранить в sequence5$
// const sequence5$: Observable<number> = sequence4$.pipe(
//     // map((val: number) => val ** 3),
//     filter((val: number) => val % 3 === 0)
//     // operators
// );

/*
* sequence4$ --1--2--3--4 |
*       map((val: number) => val ** 3)
*           --1--8--27--64 |
*       filter((val: number) => val % 3 === 0)
* sequence4$ --------27---- |
*
* */
//
// sequence5$.subscribe((value: number) => {
//     console.log('subscribe 1 ----> ', value);
// }, () => {},
//     () => {
//     console.log('complete');
//     });


// ----------
/* TAP ничего не  делает */
// interval - бесконечный

// const sequence6$: Observable<number> = interval(1000);
//
// /*
// * sequence6$ --0--1--2--3--4-- ... и т.д.
// * */
//
// const sequence7$: Observable<number> = sequence6$
//     .pipe(
//         tap((x: number) => {
//             console.log('log x ---> ', x);
//             return x ** 3 + 2;
//         })
//     );
//
// sequence7$.subscribe((value: number) => {
//             console.log('subscribe 1 ----> ', value);
//         }, () => {},
//         () => {
//             console.log('complete');
//         });

// --------------------

/* TAKE, SKIP */
// оператор take завершает бесконечный поток

// const sequence8$: Observable<number> = interval(1000);
//
// /*
// * sequence8$ --0--1--2--3--4--5--6--7--8--9--
// *   skip(5) пропусти 5 значений
// *   take(3) возьми 3 значения. take завершает поток
// * */
//
// const sequence9$: Observable<number> = sequence8$
//     .pipe(
//         tap((x: number) => console.log('log x--->', x) ), // чтобы показать, что поток идет
//         skip(5),
//         take(3)
//     );

// sequence9$.subscribe((value: number) => {
//         console.log('subscribe 1 ----> ', value);
//     }, () => {},
//     () => {
//         console.log('complete');
//     });

// ---------------
/* CONCAT
MERGE -> || */

// const sequence10$: Observable<number> = interval(500)
//     .pipe(take(4));
//
// const sequence11$: Observable<number> = interval(300)
//     .pipe(
//         take(5)
//     );
/*
* sequence10$   ----0----1----2----3|
* * sequence11$ --0--1--2--3--4|
*       merge
* sequence12$ --0-01--21-3--(24)----3| () - одновременно
* */

// const sequence12$: Observable<number> = merge(sequence10$, sequence11$);
//
// sequence12$.subscribe((value: number) => {
//         console.log('subscribe 1 ----> ', value);
//     }, () => {},
//     () => {
//         console.log('complete');
//     });

// ---------------
/* combineLatest || */

// const sequence1$: Observable<number> = interval(500)
//     .pipe(take(4));
//
// const sequence2$: Observable<number> = interval(300)
//     .pipe(
//         take(5)
//     );

/*
* sequence10$   ----0----1----2----3|
* * sequence11$ --0--1--2--3--4|
*       combineLatest
* sequence12$ ----[0,0],[0,1]--[0,2],[1,2]-[1,3]--[2,3][2,4]--[3,4]|
* */

// const sequence3$: Observable<number[]> = combineLatest(sequence1$, sequence2$);
//
// sequence3$.subscribe((value: number[]) => {
//         console.log('subscribe 1 ----> ', value);
//     }, () => {},
//     () => {
//         console.log('complete');
//     });


// ----------------------
/* ZIP */
// сопоставление один к одному

// const sequence1$: Observable<string> = of('h','e','l','l','o');
// const sequence2$: Observable<number> = interval(400)
//     .pipe(
//         take(5)
//     );

/*
* sequence1$   ---(hello)|
* * sequence2$ ---0---1---2---3---4|
*       zip((x,y) => x)
* sequence3$ ---h---e---l---l---o
* */

// const sequence3$: Observable<string> = zip(sequence1$, sequence2$)
//     .pipe(
//         map(([x, _y]: [string, number]) => x)
//     );
//
// sequence3$.subscribe((value: string) => {
//         console.log('subscribe 1 ----> ', value);
//     }, () => {},
//     () => {
//         console.log('complete');
//     });


// Пример с TouchEvent
// ---------------------------
//
// const touchStart$: Observable<number> = ( fromEvent(
//     document,
//     'touchstart'
// ) as Observable<TouchEvent>)
//     .pipe(map(({ changedTouches }: TouchEvent) => changedTouches[0].clientX));
//
// const touchEnd$: Observable<number> = ( fromEvent(
//     document,
//     'touchend'
// ) as Observable<TouchEvent>)
//     .pipe(map(({ changedTouches }: TouchEvent) => changedTouches[0].clientX));
//
//
// const swipe$: Observable<[number, number]> = zip(touchStart$, touchEnd$)
//     // переработка полученных значений
//     .pipe(
//         tap(([x1, x2]: [number, number]) => {console.log(x1, x2); })
//     );
//
// swipe$.subscribe(([startX, endX]: [number, number]) => {
//         console.log('startX - endX ----> ', startX - endX);
//         if (startX - endX > 0) {
//             console.log('left swipe');
//             return;
//         }
//         console.log('right swipe');
//     }, () => {},
//     () => {
//         console.log('complete');
//     });

// ------------------
// Обработка ошибок
//
// const sequence1$: Observable<number> = Observable.create((subscriber: Subscriber<number>) => {
//     let count = 0;
//     setInterval(() => {
//         count++;
//         if (count % 4 === 0) {
//             subscriber.error(count);
//             return;
//         }
//         subscriber.next(count);
//     }, 1000);
//
// });
//
// // целеноправленная обработка ошибок
// sequence1$.pipe(
//         catchError( (_err: Error, _out: Observable<number>) => {
//             // переключаемся на другой поток, или передать что-то иное
//             return of(1);
//         })
//         // retry(3) // но идут параллельно два потока // есть еще retryWhen
//     )
//
// .subscribe((value: number) => {
//         console.log('subscribe 1 ----> ', value);
//     }, () => {},
//     () => {
//         console.log('complete');
//     });
