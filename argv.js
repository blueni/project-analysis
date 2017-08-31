class Argv{

    constructor( config, args ){
        this.config = config
        this.args = args
        this.tasks = {}
        this.analysis()
    }

    analysis(){
        let args = this.args
        let config = this.config
        let tasks = this.tasks

        let value, arg, task
        let argFinished = false
        for( let i=0;i<args.length;i++ ){
            arg = args[i]
            if( arg.startsWith( '-' ) ){
                if( arg.startsWith( '--' ) ){
                    arg = arg.substring( 2 )
                    if( config[arg] ){
                        task = {
                            task: config[arg],
                            values: []
                        }
                        tasks[arg] = task
                    }else{
                        this.wrongArg()
                    }
                    continue
                }
                arg = arg.substring( 1 )
                let isTrueArg = false
                for( let cfg in config ){
                    if( config[cfg].short == arg ){
                        task = {
                            task: config[cfg],
                            values: []
                        }
                        tasks[cfg] = task
                        isTrueArg = true
                        break
                    }
                }
                if( !isTrueArg ){
                    this.wrongArg()
                }
            }else if( !task ){
                this.wrongArg()
            }else{
                task.values.push( arg )
            }
        }
    }

    wrongArg(){
        let config = this.config
        console.log( '命令参数错误~' )
        if( config.help ){
            config.help.operate.call( this )
        }
    }

}

module.exports = Argv
