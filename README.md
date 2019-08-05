# Заготовки базовых сущностей
___
Служат для самостоятельной разработки новых компонент.  
## основаня информация по архитектуре
**Dispatcher** - Отвечает за основной поток событий на сайте. Обычный EventEmitter, на который подписаны все сторы.  
**Компонента** - Базовый элемент сайта с описанным на javaScript-e поведением.  
**Store** - Глобальное хранилище состояний сайта. Для каждой группы компонент создается свой стор. Например, стор, хранящий состояние попапов на сайте или стор, хранящий сосотояние слайдеров.  
**View** - Простой скрипт, не имеющий представления на сайте.  
**Decorator** - Объект, который служит для изоляции части поведения компоненты. Чтобы не перегружать код, например.  

Компонента генерируют событие через диспатчер. Все сторы получают это события и проверяют по типу, волнует ли оно их. Если да, то меняют свое состояние, после чего генерируют пустое событие о своем изменении. Компоненты, подписанные на эти сторы, реагируют на их изменение, меняя свое представление на сайте.  
  
Событие, отправляемое диспатчеру выглядит так:
```javaScript
dispatcher.dispatch({
	type: 'popup:toggle', // название события
	//...любые дополнительные параметры
});
```
**type** обязателен. Через двоеточие, сначала общее название группы компонент(popup), затем конкретное событие(toggle).  
После **type** идут любые дополнительные данные, которые требуется передать в стор. Например - id конкретного попапа.  


## dispatcher
___
Основной диспатчер для **FLUX** архитектуры. Управляет основным потоком событий приложения, является по сути простым **Event Emitter**-ом. 

На него всегда подписаны все **store**-ы приложения и могут подписываться различные компоненты.  

Синтаксис:
```javaScript
dispatcher.dispatch({
	type: 'popup:toggle',
	id: 'menu-popup'
})
```

Свойство **type** обязательно в передаваемом событии.

## component.dummy
___
Базовый компонент страницы на базе **custom element**-a. Все, что имеет свое представление на странице сайта, должно быть оформлено как компонент.  

Класс позволяет создавать свои HTML элементы или расширять существующие.  
Класс должен экстэндить прототип стандартного HTML элемента или HTMLElement, если не требуется наследовать стандартное поведение какого-либо элемента.  

Код для получения названия прототипа любого элемента. Можно выполнить прямо в консоли, заменив 'form' на нужный.  
```javaScript
console.log(document.createElement('form').__proto__);

```
  
### Коллбэки
У созданного элемента будет 3 lifecycle коллбэк-а. Вызываются автоматически.  
**init** Вызывается при создании элемента.  
**connectedCallback** Вызывается при добавлении элемента на страницу.  
**disconnectedCallback** Вызывается при удалении элемента со страницы.  

Cильно облегчают разработку аяксовых сайтов с динамической подгрузкой новых элементов.  
  
Внитри каждого коллбэка **this** ссылается на сам элемент. Т.е. обладает всеми свойствами и методами HTML элемента. Чтобы случайно не переписать их, рекомендуется иментовать новые свойства начиная c нижнего подчеркивания.  

Все методы класса (кроме коллбэков) должны быть забиндены на this. Либо в **init** с использованием функции **bind**, либо при объявлении метода.  

Название компоненты обязательно должно состоять из 2-х слов, разделенных дефисом.  

### Пример базового использования.
**JavaScript**  
```javaScript
let _handleClick = function(e) {
	this._x = e.clientX;
	this._y = e.clientY;
}
// HTMLElement - прототип элемента. Для создания других элементов посмотрите как называется их прототип. Например HTMLButtonElement или HTMLInputElement.
class ElementClass extends HTMLElement {
	// Конструктор класса оставить таким. Нужен для полифилла.
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	// Вызывается при создании элемента из конструктора, всегда до connectedCallback - a.
	init() {
		this._x = 0;
		this._y = 0;

		this.handleClick = _handleClick.bind(this);
	}

	// Вызывается при добавлении элемента на страницу.
	connectedCallback() {
		this.addEventListener('click', this.handleClick);
	}

	// Вызывается при удалении элемента со страницы. Обязательно отписываться от событий завязанных не на этот элемент и сторов/диспатчера во избежание утечек памяти.
	disconnectedCallback() {
	}
}
// Обязательно указать название своего компонента. 2 слова через дефис.
customElements.define('useless-component', ElementClass);

export default ElementClass;
```

**HTML**  
```HTML
<!--Наследованте от HTMLElement-а создает новый тип элемента со своим тэгом-->
<useless-component></useless-component>
```

### Пример наследования от нативного элемента
**JavaScript**  
```javaScript
let _handleClick = function() {
	dispatcher.dispatch({
		type: 'popup:toggle',
		id: this._id
	});
}
// Мы хотим создать кнопку, поэтому указываем HTMLButtonElement в качестве прототипа.
class ElementClass extends HTMLButtonElement {
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	init() {
		this.handleClick = _handleClick.bind(this);
	}

	connectedCallback() {
		this._id = this.getAttribute('data-id');
		this.addEventListener('click', this.handleClick);
	}

	disconnectedCallback() {
	}
}
// Указываем здесь название тэга элемента, который мы расширяем.
customElements.define('popup-toggle', {
	extends: 'button'
});

export default ElementClass;
```
**HTML**
```HTML
<!--Название кастом элемента указывается в аттрибуте "is"-->
<button is="popup-toggle"></button>
```
Дополнительная информация по кастом элементам https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements

## store.dummy
___
Хранит состояние компоненты. Доступен извне в любом месте кода. Генерирует события при любом своем изменении.  
Общение со **store**-ом происходит через **dispatcher** глобальными событиями приложения.  
Внутри стора описаны все события и логика изменения состояние для каждого конкретного типа события.  
Описание **dispatcher**-а находится в корне библиотеки. Обисание **EventEmitter**-а в папке utils.  
### Пример  
Хранит id активного попапа.  
```javaScript
import dispatcher from '../dispatcher.js';
import EventEmitter from '../utils/EventEmitter.js';

let eventEmitter = new EventEmitter();

// Создаем переменные для хранения состояния.
let activePopup = null;

let _handleEvent = function(e) {
	// Проверяем свойство type события и меняем 'activePopup' в зависимости от него.
	if (e.type === 'popup:toggle') {
		if (e.id === activePopup) {
			activePopup = null;
		} else {
			activePopup = e.id;
		}
	} else if (e.type === 'popup:close') {
		if (!activePopup) return;
		activePopup = null;
	} else if (e.type === 'popup:open') {
		if (activePopup === e.id) return;
		activePopup = e.id;
	}
	// Генерируем пустое событие на любое изменение стора.
	eventEmitter.dispatch();
}

let getData = function() {
	// Функция для получения состояния стора.
	return {
		activePopup: activePopup
	}
}
// Все что ниже можно не трогать.
let _init = function() {
	dispatcher.subscribe(_handleEvent);
}

_init();

export default {
	subscribe: eventEmitter.subscribe.bind(eventEmitter),
	unsubscribe: eventEmitter.unsubscribe.bind(eventEmitter),
	getData: getData
}
```
**Пример использования в компоненте**  
```javaScript
import popupStore from './popup.store.js';

let _handleStore = function() {
	// Получаем состояние стора.
	var storeData = popupStore.getData();
	if (storeData.activePopup === this._id) {
		this.classList.add('active');
	} else {
		this.classList.remove('active');
	}
}

class ElementClass extends HTMLElement {
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	init() {
		this.handleStore = _handleStore.bind(this);
	}

	connectedCallback() {
		this._id = this.getAttribute('data-id');

		// Проверяем изначальное значение.
		this.handleStore();
		// Подписываемся на стор.
		popupStore.subscribe(this.handleStore);
	}

	disconnectedCallback() {
		// Обязательно отписываться от стора в disconnectedCallback-e.
		popupStore.unsubscribe(this.handleStore);
	}
}
customElements.define('popup-component');

export default ElementClass;
```
## view.dummy
___
Простая заготовка скрипта. Использовать, если логика не связана с компонентами на странице и существует на всех страницах сайта, т.к. не имеет никаких коллбэков. Например, роутер.  
## decorator.dummy  
___
Заготовка декоратора. 
Принимает объект-родитель, создает объект в свойстве **._decorators['decorator-name']** родителя. Служит чтобы разбить код на более мелкие файлы и изолировать часть поведения родителя. Внутри декоратора родитель доступен как **._parent**.

### Пример
```javaScript
import dispatcher from '../dispatcher.js';
// Обязательно указать имя декоратора.
let name = 'move-decorator';

class Decorator {
	constructor(parent, options) {
		this._parent = parent;
		this._options = Object.assign({
			// defaults
		}, options);
	}

	init() {
		window.addEventListener('mousemove', this.handleMousemove);
	}

	destroy() {
		window.removeEventListener('mousemove', this.handleMousemove);
	}

	handleMousemove(e) {
		let width = this._parent.clientWidth;
		let height = this._parent.clientHeight;
		let x = e.clientX;
		let y = e.clientY;

		this._parent.style.left = (x - width / 2) + 'px';
		this._parent.style.top = (y - height / 2) + 'px';
	}
}

// Все что ниже не трогать.
let attach = function(parent, options) {
	let decorator;

	if (!name) {
		console.error('decorator name is missing');
		return;
	}

	if (!parent._decorators) {
		parent._decorators = {};
	}
	if (!parent._decorators[name]) {
		parent._decorators[name] = new Decorator(parent, options);
		parent._decorators[name].init();
	}
	decorator = parent._decorators[name];

	return decorator;
}

let detach = function(parent) {
	let decorator = parent._decorators[name];
	decorator.destroy();
}

export default {
	attach: attach,
	detach: detach
}
```
**Использование в компоненте**
```javaScript
import moveDecorator from './decorators/move.decorator.js';

class ElementClass extends HTMLElement {
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	init() {
	}

	connectedCallback() {
		// Подключить декоратор при добавлении элемента на страницу.
		moveDecorator.attach(this);
	}

	disconnectedCallback() {
		// Отключить декоратор при удалении элемента со страницы.
		moveDecorator.detach(this);
	}
}
customElements.define('useless-component');

export default ElementClass;
```

##EventEmitter
___
Классический event emitter с возможной **(не обязательной)** разбивкой событий на каналы. 
Код полностью обратно совместим со старым EventEmitter-ом без подписки на каналы.  
Является зависимостью у **dispatcher**-а и всех **store**-ов при использовании FLUX архитектуры.  
Имеет набор проверок на самые распространенные ошибки при использовании EventEmitter-а.  

###Синтаксис
**Создание**  
```javaScript
var eventEmitter = new EventEmitter();
```
**Подписка**  
```javaScript
// подписка на все каналы
eventEmitter.subscribe(handler);
// или подписка на один канал
eventEmitter.subscribe('channel_name', handler);
```
**Отписка**  
```javaScript
// отписка от всех каналов
eventEmitter.unsubscribe(handler);
// или отписка от конкретного канала
eventEmitter.unsubscribe('channel_name', handler);
```
**Вызов события**  
```javaScript
// вызов в общий канал
eventEmitter.dispatch(action);
// или вызов в определенный канал
eventEmitter.dispatch('channel_name', action);
```

**handler** - это функция-обработчик
**action** - объект события с обязательным полем **type**

###Событие (action) во FLUX архитектуре
Событие - это объект, который обязательно должен содержать свойство **type**.  
Остальные свойтва могут быть любыми.  
Type может быть любым, но при разделении строки точкой с запятой, событие будет отправлено в определенный канал.  
Даже при подобном синтаксисе подписываться на определенный канал **не обязательно**, подписка на все каналы все равно поймает это событие.
```javaScript
{
	type: 'channel:name',
	...
}
```
Пример применения
```javaScript
eventEmitter.dispatch({
	type: 'popup:open',
	id: 'menu-popup'
});
```