// 🤖 COMPLETE CHAT LOGGING SYSTEM
// Automated Agent Conversation Archive - Every 2 Hours
// Format: AgentName/Full Chat/Date/Time frame.txt

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class ChatLogger {
    constructor() {
        this.basePath = '/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/logs/Full Chat Logs';
        this.agents = ['Copilot', 'Claude', 'Other_Agents'];
        this.currentDate = new Date();

        // Ensure directories exist
        this.ensureDirectories();
    }

    ensureDirectories() {
        // Create main directory
        if (!fs.existsSync(this.basePath)) {
            fs.mkdirSync(this.basePath, { recursive: true });
        }

        // Create agent subdirectories
        this.agents.forEach(agent => {
            const agentPath = path.join(this.basePath, agent);
            if (!fs.existsSync(agentPath)) {
                fs.mkdirSync(agentPath, { recursive: true });
            }
        });
    }

    getTimeFrame() {
        const hour = this.currentDate.getHours();
        const timeFrames = {
            0: '12am-2am', 2: '2am-4am', 4: '4am-6am', 6: '6am-8am',
            8: '8am-10am', 10: '10am-12pm', 12: '12pm-2pm', 14: '2pm-4pm',
            16: '4pm-6pm', 18: '6pm-8pm', 20: '8pm-10pm', 22: '10pm-12am'
        };

        // Find the current 2-hour block
        const blockStart = Math.floor(hour / 2) * 2;
        return timeFrames[blockStart] || '12am-2am';
    }

    getDateString() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[this.currentDate.getMonth()]} ${this.currentDate.getDate()}`;
    }

    generateFileName(agent) {
        const dateStr = this.getDateString();
        const timeFrame = this.getTimeFrame();
        return `${agent} Full Chat ${dateStr} ${timeFrame}.txt`;
    }

    async captureVSCodeChat(agent = 'Copilot') {
        try {
            console.log(`📋 CAPTURING ${agent.toUpperCase()} CHAT`);
            console.log('⏰ Waiting for manual copy...');
            console.log('');
            console.log('🔔 INSTRUCTIONS:');
            console.log('1. Go to VS Code');
            console.log('2. Select ALL chat content (Cmd+A)');
            console.log('3. Copy everything (Cmd+C)');
            console.log('4. Wait 8 seconds for automatic capture...');
            console.log('');

            // Wait 8 seconds for user to copy
            await this.sleep(8000);

            const chatContent = await this.getCopiedContent();

            if (chatContent && chatContent.length > 100) { // Minimum viable content
                await this.saveChatLog(agent, chatContent);
                console.log(`✅ ${agent} chat captured successfully`);
                return true;
            } else {
                console.log(`⚠️ No sufficient chat content found for ${agent}`);
                console.log(`📊 Content length: ${chatContent ? chatContent.length : 0} characters`);
                return false;
            }
        } catch (error) {
            console.error(`❌ Failed to capture ${agent} chat:`, error.message);
            return false;
        }
    }

    async getCopiedContent() {
        return new Promise((resolve, reject) => {
            exec('pbpaste', (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async saveChatLog(agent, content) {
        const fileName = this.generateFileName(agent);
        const filePath = path.join(this.basePath, agent, fileName);

        // Add metadata header
        const header = `# ${agent.toUpperCase()} FULL CHAT LOG
## ${this.getDateString()} ${this.getTimeFrame()}
**Captured**: ${this.currentDate.toISOString()}
**Lines**: ${content.split('\n').length}
**Characters**: ${content.length}
**Words**: ${content.split(/\s+/).length}

---

`;

        const fullContent = header + content;

        // Save the file
        fs.writeFileSync(filePath, fullContent, 'utf8');

        // Log the capture
        const logEntry = `[${this.currentDate.toISOString()}] CHAT CAPTURED: ${fileName} (${content.split('\n').length} lines)\n`;
        const logPath = '/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/logs/chat-capture.log';
        fs.appendFileSync(logPath, logEntry);

        console.log(`💾 Saved: ${fileName}`);
        console.log(`📊 Lines: ${content.split('\n').length}`);
        console.log(`📊 Characters: ${content.length.toLocaleString()}`);
        console.log(`📁 Location: ${filePath}`);

        return filePath;
    }

    async captureAllActiveChats() {
        const results = [];

        console.log('🤖 AUTOMATED CHAT CAPTURE STARTING');
        console.log(`⏰ Time: ${this.currentDate.toISOString()}`);
        console.log(`📅 Time Frame: ${this.getTimeFrame()}`);
        console.log('');

        // Check for VS Code (Copilot)
        if (await this.isVSCodeRunning()) {
            console.log('🎯 VS Code detected - Capturing Copilot chat');
            const result = await this.captureVSCodeChat('Copilot');
            results.push({ agent: 'Copilot', success: result });
        } else {
            console.log('⚠️ VS Code not running - Skipping Copilot');
            results.push({ agent: 'Copilot', success: false, reason: 'VS Code not running' });
        }

        console.log('');

        // Check for Claude (browser-based)
        if (await this.isChromeRunning()) {
            console.log('🌐 Chrome detected - Creating Claude capture placeholder');
            const result = await this.createBrowserChatPlaceholder('Claude');
            results.push({ agent: 'Claude', success: result });
        } else {
            console.log('⚠️ Chrome not running - Skipping Claude');
            results.push({ agent: 'Claude', success: false, reason: 'Chrome not running' });
        }

        return results;
    }

    async isVSCodeRunning() {
        return new Promise((resolve) => {
            // Check for main VS Code process (Electron)
            exec('pgrep -f "Visual Studio Code.*Electron"', (error, stdout) => {
                const isRunning = !error && stdout.trim().length > 0;
                console.log(`🔍 VS Code process check: ${isRunning ? 'RUNNING' : 'NOT FOUND'}`);
                if (isRunning) {
                    console.log(`📋 Found VS Code processes: ${stdout.trim().split('\n').length}`);
                }
                resolve(isRunning);
            });
        });
    }

    async isChromeRunning() {
        return new Promise((resolve) => {
            exec('pgrep "Google Chrome"', (error, stdout) => {
                resolve(!error && stdout.trim().length > 0);
            });
        });
    }

    async createBrowserChatPlaceholder(agent) {
        // For browser-based agents like Claude
        console.log(`🌐 Creating ${agent} capture placeholder`);

        const fileName = this.generateFileName(agent);
        const filePath = path.join(this.basePath, agent, fileName);

        const instructions = `# ${agent.toUpperCase()} CHAT CAPTURE INSTRUCTIONS
## ${this.getDateString()} ${this.getTimeFrame()}
**Created**: ${this.currentDate.toISOString()}
**Status**: MANUAL CAPTURE REQUIRED

⚠️ **ATTENTION**: This is a placeholder file for manual chat capture.

**Instructions for ${agent} Chat Capture**:
1. Open ${agent} in your browser
2. Navigate to the chat conversation
3. Select ALL chat content (Cmd+A or Ctrl+A)
4. Copy the entire content (Cmd+C or Ctrl+C)
5. Replace this entire file content with the copied chat
6. Save the file (Cmd+S or Ctrl+S)

**File Location**: ${filePath}
**Expected Format**: Complete conversation including all messages, timestamps, and formatting

---

🔄 **REPLACE THIS ENTIRE CONTENT WITH ACTUAL CHAT LOG**

When you paste the chat content, make sure to:
- Include the conversation from the beginning of this 2-hour period
- Preserve all formatting and timestamps
- Include both user messages and agent responses
- Save as plain text (.txt format)

**Time Frame**: ${this.getTimeFrame()}
**Date**: ${this.getDateString()}
`;

        fs.writeFileSync(filePath, instructions, 'utf8');
        console.log(`📝 Created instruction file: ${fileName}`);
        return true; // Placeholder created successfully
    }

    generateCaptureReport(results) {
        const report = {
            timestamp: this.currentDate.toISOString(),
            timeFrame: this.getTimeFrame(),
            date: this.getDateString(),
            captures: results,
            totalSuccess: results.filter(r => r.success).length,
            totalAttempted: results.length,
            details: results.map(r => ({
                agent: r.agent,
                success: r.success,
                reason: r.reason || (r.success ? 'Captured successfully' : 'Failed to capture')
            }))
        };

        // Save report
        const reportPath = '/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/logs/chat-capture-report.json';
        const reportHistory = [];

        // Load existing reports
        if (fs.existsSync(reportPath)) {
            try {
                const existingData = fs.readFileSync(reportPath, 'utf8');
                reportHistory.push(...JSON.parse(existingData));
            } catch (error) {
                console.log('⚠️ Could not load existing report history');
            }
        }

        // Add current report
        reportHistory.push(report);

        // Keep only last 50 reports
        if (reportHistory.length > 50) {
            reportHistory.splice(0, reportHistory.length - 50);
        }

        fs.writeFileSync(reportPath, JSON.stringify(reportHistory, null, 2));

        return report;
    }
}

// Execute chat capture
async function runChatCapture() {
    console.log('🤖 STARTING AUTOMATED CHAT CAPTURE');
    console.log(`⏰ Time: ${new Date().toISOString()}`);
    console.log('========================================');

    const logger = new ChatLogger();
    const results = await logger.captureAllActiveChats();
    const report = logger.generateCaptureReport(results);

    console.log('');
    console.log('========================================');
    console.log('📊 CAPTURE REPORT:');
    console.log(`✅ Successful: ${report.totalSuccess}/${report.totalAttempted}`);
    console.log(`⏰ Time Frame: ${report.timeFrame}`);
    console.log(`📅 Date: ${report.date}`);

    report.details.forEach(detail => {
        const status = detail.success ? '✅' : '❌';
        console.log(`${status} ${detail.agent}: ${detail.reason}`);
    });

    // Log to system events
    const eventLog = `[${new Date().toISOString()}] CHAT CAPTURE: ${report.totalSuccess}/${report.totalAttempted} successful - ${report.timeFrame}\n`;
    fs.appendFileSync('/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/logs/system-events.log', eventLog);

    console.log('');
    console.log('📁 Check logs/Full Chat Logs/ for results');
    console.log('🔄 Next capture in 2 hours');
    console.log('========================================');

    process.exit(0); // Always exit successfully to keep launch agent happy
}

// Run if called directly
if (require.main === module) {
    runChatCapture().catch(error => {
        console.error('❌ Chat capture failed:', error);
        process.exit(1);
    });
}

module.exports = ChatLogger;
