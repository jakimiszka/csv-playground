const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

class FileManager {
    constructor() {
        this.currentDir = process.cwd();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    // List all files and folders in current directory
    async listFiles() {
        try {
            console.log(`\nContents of: ${this.currentDir}`);
            console.log('─'.repeat(50));
            
            const items = await fs.readdir(this.currentDir);
            
            for (const item of items) {
                const itemPath = path.join(this.currentDir, item);
                const stats = await fs.stat(itemPath);
                
                const type = stats.isDirectory() ? '[DIR]' : '[FILE]';
                const size = stats.isDirectory() ? '' : `(${this.formatBytes(stats.size)})`;
                const permissions = this.formatPermissions(stats.mode);
                const modified = stats.mtime.toLocaleDateString();
                
                console.log(`${type.padEnd(6)} ${item.padEnd(30)} ${size.padEnd(10)} ${permissions} ${modified}`);
            }
        } catch (error) {
            console.error('Error listing files:', error.message);
        }
    }

    // Copy file or directory
    async copyItem(source, destination) {
        try {
            const srcPath = path.resolve(this.currentDir, source);
            const destPath = path.resolve(this.currentDir, destination);

            // Check if source exists
            await this.checkExists(srcPath, 'Source');

            const stats = await fs.stat(srcPath);

            if (stats.isDirectory()) {
                await this.copyDirectory(srcPath, destPath);
                console.log(`✓ Directory copied: ${source} → ${destination}`);
            } else {
                await fs.copyFile(srcPath, destPath);
                console.log(`✓ File copied: ${source} → ${destination}`);
            }
        } catch (error) {
            console.error('Error copying:', error.message);
        }
    }

    // Recursive directory copy helper
    async copyDirectory(src, dest) {
        await fs.mkdir(dest, { recursive: true });
        const items = await fs.readdir(src);

        for (const item of items) {
            const srcPath = path.join(src, item);
            const destPath = path.join(dest, item);
            const stats = await fs.stat(srcPath);

            if (stats.isDirectory()) {
                await this.copyDirectory(srcPath, destPath);
            } else {
                await fs.copyFile(srcPath, destPath);
            }
        }
    }

    // Move/rename file or directory
    async moveItem(source, destination) {
        try {
            const srcPath = path.resolve(this.currentDir, source);
            const destPath = path.resolve(this.currentDir, destination);

            // Check if source exists
            await this.checkExists(srcPath, 'Source');

            await fs.rename(srcPath, destPath);
            console.log(`✓ Moved: ${source} → ${destination}`);
        } catch (error) {
            console.error('Error moving:', error.message);
        }
    }

    // Delete file or directory
    async deleteItem(target) {
        try {
            const targetPath = path.resolve(this.currentDir, target);

            // Check if target exists
            await this.checkExists(targetPath, 'Target');

            const stats = await fs.stat(targetPath);

            if (stats.isDirectory()) {
                await fs.rmdir(targetPath, { recursive: true });
                console.log(`✓ Directory deleted: ${target}`);
            } else {
                await fs.unlink(targetPath);
                console.log(`✓ File deleted: ${target}`);
            }
        } catch (error) {
            console.error('Error deleting:', error.message);
        }
    }

    // Change permissions (chmod)
    async changePermissions(target, mode) {
        try {
            const targetPath = path.resolve(this.currentDir, target);

            // Check if target exists
            await this.checkExists(targetPath, 'Target');

            // Convert string mode to octal if needed
            const octalMode = typeof mode === 'string' ? parseInt(mode, 8) : mode;
            
            await fs.chmod(targetPath, octalMode);
            console.log(`✓ Permissions changed: ${target} → ${mode}`);
        } catch (error) {
            console.error('Error changing permissions:', error.message);
        }
    }

    // Change directory
    async changeDirectory(newDir) {
        try {
            const targetDir = path.resolve(this.currentDir, newDir);
            
            // Check if directory exists and is accessible
            const stats = await fs.stat(targetDir);
            if (!stats.isDirectory()) {
                throw new Error('Not a directory');
            }

            this.currentDir = targetDir;
            console.log(`✓ Changed directory to: ${this.currentDir}`);
        } catch (error) {
            console.error('Error changing directory:', error.message);
        }
    }

    // Create directory
    async createDirectory(name) {
        try {
            const dirPath = path.resolve(this.currentDir, name);
            await fs.mkdir(dirPath, { recursive: true });
            console.log(`✓ Directory created: ${name}`);
        } catch (error) {
            console.error('Error creating directory:', error.message);
        }
    }

    // Create file
    async createFile(name, content = '') {
        try {
            const filePath = path.resolve(this.currentDir, name);
            await fs.writeFile(filePath, content);
            console.log(`✓ File created: ${name}`);
        } catch (error) {
            console.error('Error creating file:', error.message);
        }
    }

    // Helper method to check if path exists
    async checkExists(itemPath, itemType = 'Item') {
        try {
            await fs.access(itemPath);
        } catch (error) {
            throw new Error(`${itemType} does not exist: ${itemPath}`);
        }
    }

    // Format file size
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // Format permissions in rwx format
    formatPermissions(mode) {
        const permissions = [];
        
        // Owner permissions
        permissions.push((mode & 0o400) ? 'r' : '-');
        permissions.push((mode & 0o200) ? 'w' : '-');
        permissions.push((mode & 0o100) ? 'x' : '-');
        
        // Group permissions
        permissions.push((mode & 0o040) ? 'r' : '-');
        permissions.push((mode & 0o020) ? 'w' : '-');
        permissions.push((mode & 0o010) ? 'x' : '-');
        
        // Other permissions
        permissions.push((mode & 0o004) ? 'r' : '-');
        permissions.push((mode & 0o002) ? 'w' : '-');
        permissions.push((mode & 0o001) ? 'x' : '-');
        
        return permissions.join('');
    }

    // Display help menu
    displayHelp() {
        console.log('\n📁 File Manager Commands:');
        console.log('─'.repeat(40));
        console.log('ls, list          - List files and directories');
        console.log('cd <dir>          - Change directory');
        console.log('mkdir <name>      - Create directory');
        console.log('touch <name>      - Create empty file');
        console.log('cp <src> <dest>   - Copy file/directory');
        console.log('mv <src> <dest>   - Move/rename file/directory');
        console.log('rm <target>       - Delete file/directory');
        console.log('chmod <file> <mode> - Change permissions (e.g., chmod file.txt 755)');
        console.log('pwd               - Show current directory');
        console.log('help, h           - Show this help');
        console.log('exit, quit        - Exit file manager');
        console.log('');
    }

    // Main interactive loop
    async start() {
        console.log('🚀 Simple Node.js File Manager');
        console.log('Type "help" for available commands');
        
        await this.listFiles();
        this.promptUser();
    }

    promptUser() {
        this.rl.question('\n📁 > ', async (input) => {
            const [command, ...args] = input.trim().split(' ');

            switch (command.toLowerCase()) {
                case 'ls':
                case 'list':
                    await this.listFiles();
                    break;

                case 'cd':
                    if (args.length === 0) {
                        console.log('Usage: cd <directory>');
                    } else {
                        await this.changeDirectory(args[0]);
                    }
                    break;

                case 'pwd':
                    console.log(`Current directory: ${this.currentDir}`);
                    break;

                case 'mkdir':
                    if (args.length === 0) {
                        console.log('Usage: mkdir <directory_name>');
                    } else {
                        await this.createDirectory(args[0]);
                    }
                    break;

                case 'touch':
                    if (args.length === 0) {
                        console.log('Usage: touch <filename>');
                    } else {
                        await this.createFile(args[0]);
                    }
                    break;

                case 'cp':
                case 'copy':
                    if (args.length < 2) {
                        console.log('Usage: cp <source> <destination>');
                    } else {
                        await this.copyItem(args[0], args[1]);
                    }
                    break;

                case 'mv':
                case 'move':
                    if (args.length < 2) {
                        console.log('Usage: mv <source> <destination>');
                    } else {
                        await this.moveItem(args[0], args[1]);
                    }
                    break;

                case 'rm':
                case 'delete':
                    if (args.length === 0) {
                        console.log('Usage: rm <file_or_directory>');
                    } else {
                        await this.deleteItem(args[0]);
                    }
                    break;

                case 'chmod':
                    if (args.length < 2) {
                        console.log('Usage: chmod <file> <permissions> (e.g., chmod file.txt 755)');
                    } else {
                        await this.changePermissions(args[0], args[1]);
                    }
                    break;

                case 'help':
                case 'h':
                    this.displayHelp();
                    break;

                case 'exit':
                case 'quit':
                    console.log('👋 Goodbye!');
                    this.rl.close();
                    return;

                case '':
                    break;

                default:
                    console.log(`Unknown command: ${command}. Type "help" for available commands.`);
            }

            this.promptUser();
        });
    }
}

// Usage
if (require.main === module) {
    const fileManager = new FileManager();
    fileManager.start();
}

module.exports = FileManager;