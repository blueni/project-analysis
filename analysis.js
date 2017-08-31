const fs = require( 'fs' )
const path = require( 'path' )
const { iterateFiles, readFileLines, pathTest, _tempOut } = require( './util.js' )

class Analysis{

    constructor( argv ){
        this.includes = []
        this.excludes = [
            '.git', '.gitignore', '.svn', 'yarn.*', 'npm.*', 'package.json', '.vscode'
        ]
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
        iterateFiles( cwd, ( dir, file ) => {
            let fullFile = dir
            if( file ){
                fullFile = path.join( dir, file )
            }
            if( pathTest( includes, fullFile ) === false || pathTest( excludes, fullFile ) ){
                return false
            }
            if( file ){
                return readFileLines( fullFile ).then( lines => {
                    count += lines
                    console.log( '项目文件 ', fullFile, '的行数为', lines )
                })
            }
        }, ( res ) => {
            console.log( '-'.repeat( 40 ) )
            console.log( '项目代码总行数为：', count )
            _tempOut.close()
        })

    }

}

module.exports = Analysis
