#!/usr/bin/env python3
"""
🚀 VIPER DUAL-MACHINE COORDINATOR
Launches both Mac Pro and Mac Studio simultaneously via SSH
"""

import asyncio
import subprocess
import sys
import os
from pathlib import Path

async def coordinate_dual_machines(input_file, ssh_host="10.0.0.115", ssh_user="vandendool"):
    """Launch both machines simultaneously via SSH coordination"""
    
    print("🚀 LAUNCHING DUAL-MACHINE COORDINATION!")
    print(f"🖥️  Local: Mac Studio processing rows 300,001+")
    print(f"🖥️  Remote: Mac Pro ({ssh_host}) processing rows 0-300,000")
    
    # Build remote command for Mac Pro
    remote_script = "Claude Viper Ultimate 2.0.py"
    remote_cmd = [
        "ssh", f"{ssh_user}@{ssh_host}",
        f"cd ~/Harmonic\\ Oracle\\ MacPro/untitled\\ folder && python3 {remote_script} --input {input_file}"
    ]
    
    # Build local command for Mac Studio
    local_cmd = [
        sys.executable, "Claude Viper Ultimate 2.0.py", "--input", input_file
    ]
    
    print("🔄 Starting Mac Pro processing via SSH...")
    print(f" SSH Command: {' '.join(remote_cmd)}")
    print("🔄 Starting Mac Studio processing locally...")
    print(f"💻 Local Command: {' '.join(local_cmd)}")
    
    # Start both processes
    mac_pro_task = asyncio.create_subprocess_exec(*remote_cmd)
    mac_studio_task = asyncio.create_subprocess_exec(*local_cmd)
    
    # Wait for both to complete
    print("⏳ Waiting for both machines to complete processing...")
    mac_pro_proc, mac_studio_proc = await asyncio.gather(mac_pro_task, mac_studio_task)
    
    print("🎉 DUAL-MACHINE PROCESSING COMPLETE!")
    print(f"🖥️  Mac Pro exit code: {mac_pro_proc.returncode}")
    print(f"💻 Mac Studio exit code: {mac_studio_proc.returncode}")
    
    if mac_pro_proc.returncode == 0 and mac_studio_proc.returncode == 0:
        print("✅ Both machines completed successfully!")
        return 0
    else:
        print("❌ One or both machines failed!")
        return 1

async def main():
    """Main coordinator function"""
    if len(sys.argv) < 2:
        print("Usage: python dual_machine_coordinator.py <input_file>")
        return 1
    
    input_file = sys.argv[1]
    
    if not os.path.exists(input_file):
        print(f"❌ Input file not found: {input_file}")
        return 1
    
    return await coordinate_dual_machines(input_file)

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
