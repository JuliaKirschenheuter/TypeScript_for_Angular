// @ts-ignore
import { from, fromEvent, Observable, of, SchedulerLike } from 'rxjs';
// @ts-ignore
import { catchError, debounceTime, distinctUntilChanged, filter, map, pluck, switchMap } from 'rxjs/operators';
import { async } from 'rxjs/internal/scheduler/async';

// LIVESEARCH

interface IItem {
    name: string;
}

const searchElement: HTMLInputElement = document.querySelector('.live-search') as HTMLInputElement;
const searchInputEventSequence$: Observable<Event> = fromEvent(searchElement, 'input');

function searchFetch(value: string): Observable<IItem[]> {
    return from(
        fetch( (`https://api.github.com/search/repositories?q=${value}`) )
            .then((response: Response) => response.json() )
    );
}

function search(source1$: Observable<Event>,
                sourceCreator$: (value: string) => Observable<IItem[]>,
                schedule: SchedulerLike = async): Observable<IItem[]> {

    return source1$
        .pipe (
            debounceTime(500, schedule),
            pluck('target', 'value'),
            filter((value: string) => value !== ''),
            // distinctUntilChanged(),
            switchMap((value: string) => sourceCreator$(value)
                .pipe(
                    catchError(() => of([]))
                )
            )
        );

}

search(searchInputEventSequence$, searchFetch)
    .subscribe(
        (result: IItem[]) => {
            console.log(result);
    });
