const fs = require( 'fs' )
const path = require( 'path' )
const { iterateFiles, readFileLines, pathTest, _tempFile } = require( './util.js' )

class Analysis{

    constructor( argv ){
        this.includes = []
        this.excludes = [
            '.git', '.gitignore', '.analysis-ignore', '.svn', 'yarn.*', 'npm.*', 'package.json', '.vscode',
            '*.mp4', '*.png', '*.jpg', '*.jpeg', '*.gif', '*.ico', '_template.tmpl',
        ]
        let ignoreFiles = [ '.gitignore', '.analysis-ignore' ]
        ignoreFiles.forEach( file => {
            if( fs.existsSync( path.join( process.cwd(), file ) ) ){
                let excludes = fs.readFileSync( path.join( process.cwd(), file ), 'utf-8' )
                this.excludes.push( ...excludes.split( /\r*\n/ ) )
            }
        })
        this.argv = argv
    }

    init(){
        let tasks = this.argv.tasks
        let task
        for( let key in tasks ){
            task = tasks[key].task
            if( task.operate ){
                task.operate.apply( this, task.values )
            }
        }
        if( !Object.keys( tasks ).length ){
            this.argv.wrongArg()
        }
    }

    run(){
        let tasks = this.argv.tasks
        this.init()
        if( tasks.lines ){
            this.codeLineCount()
        }
    }

    codeLineCount(){
        let cwd = process.cwd()
        let includes = this.includes
        let excludes = this.excludes
        let count = 0

        console.log( `
${'*'.repeat( 40 )}
        开始计算项目代码总行数
${'*'.repeat( 40 )}
    ` )
        iterateFiles( cwd, ( file, isDir  ) => {
            if( pathTest( includes, file ) === false || pathTest( excludes, file ) ){
                return false
            }
            if( !isDir ){
                return readFileLines( file ).then( lines => {
                    count += lines
                    console.log( '项目文件 ', file, '的行数为', lines )
                })
            }
        }, ( res ) => {
            console.log( '-'.repeat( 40 ) )
            console.log( '项目代码总行数为：', count )
            try{
                if( fs.existsSync( _tempFile ) ){
                    fs.unlinkSync( _tempFile )
                }
            }catch( err ){}
        })

    }

}

module.exports = Analysis
