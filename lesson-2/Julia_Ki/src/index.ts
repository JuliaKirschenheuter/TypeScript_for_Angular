// @ts-ignore
import {
     from,
    } from 'rxjs';
// @ts-ignore
import { catchError, map, observeOn, publish, switchAll, switchMap, take } from 'rxjs/operators';
// @ts-ignore
import { asap } from 'rxjs/internal/scheduler/asap';
import { async } from 'rxjs/internal/scheduler/async';
// import { async } from 'rxjs/internal/scheduler/async';
// import { asap } from 'rxjs/internal/scheduler/asap';

// обработка ошибок
// const sequense$: Observable<number | string> = interval(1000)
//     .pipe(
//         map((value: number) => {
//             if (value % 3 === 0 && value !== 0) {
//                 return value.toString();
//             }
//             return value;
//         })
//     );
//
// sequense$
//     .pipe(
//
//         // (*) создать поток высшего порядка: switchMap(), mergeMap()
//         // switchMap это как переключение на другой поток, в данном случае of. switchMap делает subscribe в subscribe
//         // 1--2--3--4--5--6--
//         // |  |  |  |  |  |
//         // 1--2--3--4--5--6--   <-- каждое значение это конечный поток с текущим значением value
//
//         // ВАРИАНТ 2: переход на новый поток с (!) catchError. ВЫСШИЙ ПОТОК НЕ ЗАВЕРШАЕТСЯ. предпочтительный вариант
//         // switchMap((value: number) => {
//         //     // из каждого значения value создается поток
//         //     return of(value)
//         //         .pipe(
//         //             map((v: number) => {
//         //                     return v.toFixed();
//         //                 }
//         //             ),
//         //             // catchError: ПРИНИМАЕТ ОШИБКИ.
//         //             // ПОТОК В ПОТОКЕ БУДЕТ ЗАКОНЧЕН. СОЗДАННЫЙ В НЕМ НОВЫЙ ПОТОК будет "зарезолвен".
//         //             catchError((_err: Error, _inner: Observable<string | number>) => {
//         //             // ВОЗВРАЩАЕТ НОВЫЙ ПОТОК с одного ошибочного примитива value.
//         //                 return of(1000);
//         //             })
//         //         );
//         // }),
//
//         // ВАРИАНТ 1: TRY&CATCH. ПРИ TRY&CATCH ВЫСШИЙ ПОТОК НЕ ЗАВЕРШАЕТСЯ
//         // map((value: number) => {
//         //     try {
//         //         return value.toFixed();
//         //     } catch (err) {
//         //         // (!) просто верни текущее значение и ничего не делай
//         //         return value;
//         //
//         //         // В "ячейке" вместо значения (value) вернется Observable (т.е. застрартует новый поток)
//         //         // тогда наш поток становится ПОТОКОМ ВЫСШЕГО ПОРЯДКА (high order observable)
//         //         // если это так, то в subscribe (**) необходимо подписаться И НА ЭТО значение. см (*) switchMap чтобы это не делать
//         //         // return of(0);
//         //     }
//         //
//         // }),
//     )
//
//     .subscribe(
//         (value: number | string | Observable<string | number>) => {
//             console.log(value);
//             // (**)  и чтобы этого не делать => см. switchMap
//             // value.subscribe(
//             //     (valueSecondStream: string | number) => { console.log(valueSecondStream); },
//             // );
//         },
//         (err: Error) => {
//             console.error(err);
//         },
//         () => {
//             console.log('complete');
//         });


// ------------------------
// еще раз про потоки высшего уровня
// но это плохая практика. чтобы не делать subscribe в subscribe делают switchAll. switchMap = map + switchAll
// const sequence1$: Observable<number> = interval(1000)
//     .pipe(take(4));
//
// const highOrderSequence$: Observable < Observable<number>> = sequence1$.pipe(
//     // каждому зачению от sequence1$ присваиваем новый конечный поток со значениями 1, 2
//     map((_value: number) => of(1, 2))
// );
// highOrderSequence$.subscribe((value: Observable<number>) => {
//         value.subscribe((v: number) => {
//             console.log(v);
//         });
// });

// решение с switchAll
// const sequence1$: Observable<number> = interval(1000)
//     .pipe(take(4));
//
// const highOrderSequence$: Observable<number> = sequence1$.pipe(
//     // каждому зачению от sequence1$ присваиваем новый конечный поток со значениями 1, 2
//     map((_value: number) => of(1, 2)),
//     switchAll()
// );
//
// highOrderSequence$.subscribe((value: number) => {
//     console.log(value);
// });

// ----------------------
// НАПИСАТЬ КАСТОМНЫЙ ОПЕРАТОР: skip(5), take(3), skip(5). тк подобного еще не существует

// создается новый поток по нашей логике
// class SkipLimitSubscribe extends Subscriber<number> {
//
//     private _interval: number = 1;
//     private _count: number = 1;
//
//     public constructor(subscriber: Subscriber<number>, private _skip: number, private _limit: number) {
//         super(subscriber);
//     }
//
//     protected _next(value: number): void {
//         const borderLow: number = this._interval * (this._skip + this._limit) - this._limit;
//         const borderHight: number = borderLow + this._limit;
//         if (borderLow < this._count && this._count <= borderHight) {
//             this.destination && this.destination.next(value);
//             this._count++;
//             if (borderHight < this._count) {
//                 this._interval++;
//             }
//             return;
//         }
//         this._count++;
//     }
// }
//
// function skipLimit(skip: number, limit: number): (source: Observable<number>) => Observable<number> {
//     return (source: Observable<number>): Observable<number> => {
//         return source.lift({
//             call(subscriber: Subscriber<number>): void {
//                 source.subscribe(new SkipLimitSubscribe(subscriber, skip, limit));
//             }
//         });
//     };
// }
//
//
// interval(1000)
//     .pipe(skipLimit(4, 3))
//     .subscribe((value: number) => {
//         console.log(value);
//     });


// ------------------------------
// Контролируемые потоки


// iterator + observer = Observable
// iterator - чтобы во времени распределять какие-то значения.
// observer - чтобы иметь возможность подписаться и передать значение

// Observable + Observer = Subject
// Subject по умолчанию - бесконечный контролируемый горячий поток
// $$ - контролируемый поток
// Observer - это как Subscriber
//
// const sequence$$: Subject<string> = new Subject;
// //
// // // пока нет подписчика - ничего не увидим. Новое значение с next передаем после подписки
// // // const sub1$: Subscription = sequence$$.subscribe((value: string) => { // чтобы была возможность от него отписатся
// sequence$$.subscribe((value: string) => {
//     console.log('sub 1 ----> ', value);
// });
//
// // пока в поток не передастся значение, мы ничего не уидим
// sequence$$.next('Hi');
//
// setTimeout(() => {
//     console.log('after 3 sec');
//     // тут происходит только подписка
//     sequence$$.subscribe((value: string) => {
//         console.log('sub 2 ----> ', value);
//     });
// }, 3000);
//
// setTimeout(() => {
//     console.log('after 5 sec');
//     // через 5 сек происходит передача значения
//     sequence$$.next('Angular');
// }, 5000);


// -------------------------
// BehaviorSubject
//
// const sequence$$: BehaviorSubject<string> = new BehaviorSubject('Initial value');
// // кеширование ПОСЛЕДНЕГО значения в потоке. сразу после подписки мы получим значение, переданное при инициализации
//
// sequence$$.subscribe((value: string) => {
//     console.log('sub 0 ----> ', value);
// });
//
// sequence$$.next('Java');
//
// sequence$$.subscribe((value: string) => {
//     console.log('sub 1 ----> ', value);
// });
//
// sequence$$.next('Hi');
//
//
// setTimeout(() => {
//     console.log('after 3 sec');
//     sequence$$.subscribe((value: string) => {
//         console.log('sub 2 ----> ', value);
//     });
// }, 3000);
//
// setTimeout(() => {
//     console.log('after 5 sec');
//     sequence$$.next('Angular');
// }, 5000);


// --------------------
// охладить поток - ReplaySubject
// если не передали аргументов - то поток становится полностью холодным, и значит значения забираются с начала
// если есть арг. по окну x знач-й, то берутся последние x-значений (те поток с x последними знач-ми становится холодным)
// так же как и поток с x - ms. становится холодным. все что было "emit" x - ms назад попадет в результат
//
// const sequence$$: ReplaySubject<string> = new ReplaySubject();
//
// sequence$$.next('Java');
//
// sequence$$.next('Hi');
//
// setTimeout(() => {
//     console.log('after 2 sec');
//     sequence$$.next('TypeScript');
//     sequence$$.subscribe((value: string) => {
//         console.log('sub 1 ----> ', value);
//     });
// }, 2000);
//
// setTimeout(() => {
//     console.log('after 5 sec');
//     sequence$$.next('Angular');
//     sequence$$.subscribe((value: string) => {
//         console.log('sub 2 ----> ', value);
//     });
// }, 5000);

// --------------------------------
// AsyncSubject
// этот поток начинает срабатывать только после его завершения
// и после завершения этот поток закеширует последнее значение
//
// const sequence$$: AsyncSubject<string> = new AsyncSubject();
//
// sequence$$.subscribe((value: string) => {
//     console.log('sub 0 ----> ', value);
// });
// sequence$$.next('Java');
//
// sequence$$.next('Hi');
//
// sequence$$.complete();
//
// sequence$$.subscribe((value: string) => {
//     console.log('sub 1 ----> ', value);
// });
//
// setTimeout(() => {
//     console.log('after 5 sec');
//     sequence$$.subscribe((value: string) => {
//         console.log('sub 2 ----> ', value);
//     });
// }, 5000);


// как сделать холодный поток горячим? -> мультикастинг
// muliticast + subject = publish, можно использовать его
// const controlSequence$$: Subject<number> = new Subject;
//
// const connectableObservable$: ConnectableObservable<number> = interval(1000)
//     .pipe(
//         // multicast(controlSequence$$)
//         publish()
//     ) as ConnectableObservable<number>;
//
// // connectableObservable$.connect();
//
// connectableObservable$.subscribe((value: number) => {
//     console.log('sub 1 -->', value);
// });
//
// // данный ConnectableObservable ничего не будет делать, пока на него не вызовут .connect()
// setTimeout(() => {
//     connectableObservable$.connect();
// }, 2000);
//
//
// setTimeout(() => {
//     // и тут после второй подписки наш поток становится горячим!!!
//     // через 7 мс после второй подписки поток станет горячим!
//     connectableObservable$.subscribe((value: number) => {
//         console.log('sub 2 -->', value);
//     });
// }, 10000);


// РАСПИСАНИЕ

console.log('Start');

setTimeout(() => console.log('timeout 1'));
setTimeout(() => console.log('timeout 2'));
Promise.resolve()
    .then(() => {console.log('promise 1'); });
Promise.resolve()
    .then(() => {console.log('promise 2'); });

const arr: number[] = [];
for (let i: number = 0; i < 10000; i++) {
    arr.push(i);
}

console.time('Schedule');

// без задания observeOn все выполняется синхронно
from(arr)
    // observeOn - ПЛАНИРОВЩИК
    // тут observeOn(async) говорит, что все что происходит в map надо рассматривать как макротаск(Ajax-запрос)
    // чтобы с map работать в концепции микротаска - надо использовать observeOn(asap)
    // это значит что каждый map уйдет на новый виток eventLoop
    .pipe(observeOn(async), map((y: number) => y * 2 % 3))
    .subscribe(
        () => {},
        () => {},
        () => {
        console.timeEnd('Schedule');
    });

console.log('End');
