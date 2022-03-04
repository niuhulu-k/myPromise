const isFunction = value => typeof value === 'function'
// 定义Promise的三种状态常量
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

class MyPromise {
    constructor(handle) {
        if (!isFunction(handle)) {
            throw new Error('myPromise just accept a function as a parameter')
        }
        // 添加状态
        this._status = PENDING
        // 添加返回值
        this._value = undefined
        // 添加成功回调函数队列
        this.fulfilledCallbackList = []
        // 添加失败回调函数队列
        this.rejectedCallBackList = []
        // 执行handle
        try {
            handle(this._resolve.bind(this), this._reject.bind(thisf))
        } catch (error) {

        }

    }
    // 添加resolve时执行的函数
    _resolve(val) {
        // 依次执行成功队列中的函数，并清空队列
        const run = () => {
            if (this._status !== PENDING) return
            const runFulfilled = (value) => {
                let cb
                while (cb = this.fulfilledCallbackList.shift()) {
                    cb(val)
                }
            }
            const runRejected = (value) => {
                let cb
                while (cb = this.rejectedCallBackList.shift()) {
                    cb(val)
                }
            }

            if (val instanceof MyPromise) {
                val.then(value => {
                    this._value = value
                    this._status = FULFILLED
                    runFulfilled(value)
                }, error => {
                    this._value = error
                    this._status = REJECTED
                    runRejected(error)
                })
            } else {
                this._value = value
                this._status = FULFILLED
                runFulfilled(value)
            }
        }

        //  为了支持同步的promise,当我们的promise实例reslove时，它的then方法还没执行到，所以回调函数还没注册上，这时reslove中调用成功回调肯定会报错的。
        // 就是在reslove和reject里面用setTimeout进行包裹，使其到then方法执行之后再去执行，这样我们就让promise支持传入同步方法，另外，关于这一点，Promise/A+规范里也明确要求了这一点。
        setTimeout(() => run(), 0)
    }

    _reject(val) {
        if (this._status !== PENDING) return
        const run = () => {
            this._status = REJECTED
            this._value = val
            let ac
            while (cb = this.rejectedCallBackList.shift()) {
                cb(val)
            }
        }
        setTimeout(run, 0)
    }
    then(onFulfilled, onRejected) {
        const { _value, _status } = this
        return new MyPromise((onFulfilledNext, onRejectedNext) => {
            // 封装一个当前promise成功时执行的函数
            let fulfilled = value => {
                try {
                    // then的第一个参数未传入一个函数时，执行该promise的resolve
                    if (!isFunction(onFulfilled)) {

                        onFulfilledNext(value)

                    } else {
                        // 执行成功的回调函数
                        let res = onFulfilled(value)
                        if (res instanceof MyPromise) {

                            res.then(onFulfilledNext, onRejectedNext)

                        } else {

                            onFulfilledNext(value)

                        }
                    }

                } catch (error) {
                    // 如果函数执行错误，新的Promise对象的状态为失败
                    onRejectedNext(error)
                }
            }
            let rejected = error => {
                try {
                    if (!isFunction(onRejected)) {
                        onFulfilledNext(error)
                    } else {
                        let res = onRejected(error)
                        if (res instanceof MyPromise) {
                            res.then(onFulfilledNext, onRejectedNext)
                        } else {
                            onFulfilledNext(res)
                        }
                    }
                } catch (error) {
                    onRejectedNext(error)
                }
            }

            switch (_status) {
                // 当状态为pending时，将then方法回调函数加入执行队列等待执行
                case PENDING:
                    this.fulfilledCallbackList.push(fulfilled)
                    this.rejectedCallBackList.push(rejected)
                    break
                case FULFILLED:
                    fulfilled(_value)
                    break
                case REJECTED:
                    rejected(_value)
                    break
            }

        })

    }
    // 添加静态resolve方法
    static resolve(value) {
        if (value instanceof MyPromise) return value
        return new MyPromise(resolve => resolve(value))
    }
    // 添加静态reject方法
    static reject(value) {
        return new MyPromise((resolve, reject) => reject(value))
    }
    // 添加静态all方法
    static all(list) {
        return new MyPromise((resolve, reject) => {
            let values = []
            let count = 0
            for (let [i, p] of list.entries()) {
                // 数组参数如果不是myPromise实例，先调用myPromise.resolve
                this.resolve(p).then(res => {
                    values[i] = res
                    count++
                    // 所有状态都变成fulfilled时返回的MyPromise状态就变成fulfilled
                    if (count === list.length) resolve(values)
                }, err => {
                    // 有一个被rejected时返回的MyPromise状态变成rejected
                    reject(err)
                })
            }
        })
    }
    // 添加静态race
    static race(list) {
        return new MyPromise((resolve, reject) => {
            for (let p of list) {
                // 只要有一个实例改变状态，新的promise的状态就会改变
                this.resolve(p).then(res => {
                    resolve(res)
                }, err => {
                    reject(err)
                })
            }
        })
    }
    finally(cb) {
        return this.then{
            value => MyPromise.resolve(cb()).then(() => value),
                reason => MyPromise.resolve(cb()).then(() => { throw reason })
        }
    }
}