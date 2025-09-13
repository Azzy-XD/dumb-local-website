#!/usr/bin/env python3
"""
Dumbass Calculator Universal Network Server
Hosts the calculator on ALL network interfaces (WiFi, Ethernet, Hotspot)
Accessible from ANY device on ANY connected network
"""

import http.server
import socketserver
import socket
import os
import sys
import webbrowser
import netifaces
from urllib.parse import urlparse
import threading
import time
import subprocess
import platform

class UniversalHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Enhanced HTTP handler with universal network support"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)
    
    def do_GET(self):
        """Handle GET requests with custom routing"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Custom route: /idklmao -> serve mainindex.html
        if path == '/idklmao' or path == '/idklmao/':
            self.serve_main_page()
        # Root redirect to custom route
        elif path == '/' or path == '':
            self.send_response(302)
            self.send_header('Location', '/idklmao')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
        # Handle calculator sub-routes
        elif path.startswith('/normal/') or path.startswith('/dumbass/'):
            super().do_GET()
        # Remove /idklmao prefix for sub-routes
        elif path.startswith('/idklmao/'):
            self.path = path[8:]  # Remove '/idklmao' prefix
            if self.path.startswith('/'):
                self.path = self.path[1:]  # Remove leading slash
            super().do_GET()
        else:
            super().do_GET()
    
    def serve_main_page(self):
        """Serve the main calculator selector page"""
        try:
            with open('mainindex.html', 'rb') as file:
                content = file.read()
                
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Cache-Control', 'no-cache')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(content)
            
        except FileNotFoundError:
            self.send_error(404, "mainindex.html not found - Make sure you're in the correct directory!")
        except Exception as e:
            self.send_error(500, f"Server error: {str(e)}")
    
    def log_message(self, format, *args):
        """Enhanced logging with network info"""
        client_ip = self.address_string()
        timestamp = self.log_date_time_string()
        message = format % args
        
        # Determine network type based on IP
        network_type = "🌐"
        if client_ip.startswith("127."):
            network_type = "💻"
        elif client_ip.startswith("192.168."):
            network_type = "📶"  # WiFi
        elif client_ip.startswith("10.") or client_ip.startswith("172."):
            network_type = "🔗"  # Ethernet/Corporate
        elif client_ip.startswith("169.254."):
            network_type = "📱"  # Hotspot/Ad-hoc
        
        # Status emoji
        status_emoji = "✅" if '200' in message else "🔄" if '302' in message else "❌"
        
        print(f"{network_type} {status_emoji} [{timestamp}] {client_ip} - {message}")

def get_all_network_interfaces():
    """Get ALL network interfaces and their IP addresses"""
    interfaces = {}
    
    try:
        # Get all network interfaces
        for interface_name in netifaces.interfaces():
            addrs = netifaces.ifaddresses(interface_name)
            
            # Get IPv4 addresses
            if netifaces.AF_INET in addrs:
                for addr_info in addrs[netifaces.AF_INET]:
                    ip = addr_info.get('addr')
                    if ip and not ip.startswith('127.'):  # Exclude loopback
                        interfaces[interface_name] = ip
                        
    except ImportError:
        # Fallback if netifaces not available
        interfaces = get_basic_network_info()
    except Exception as e:
        print(f"⚠️  Warning: Could not get all network interfaces: {e}")
        interfaces = get_basic_network_info()
    
    return interfaces

def get_basic_network_info():
    """Fallback method to get basic network info"""
    interfaces = {}
    
    try:
        # Try to get primary network interface
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        primary_ip = s.getsockname()[0]
        s.close()
        
        interfaces['primary'] = primary_ip
        
        # Try to get hostname-based IP
        hostname = socket.gethostname()
        hostname_ip = socket.gethostbyname(hostname)
        if hostname_ip != primary_ip:
            interfaces['hostname'] = hostname_ip
            
    except Exception as e:
        print(f"⚠️  Warning: Could not get network info: {e}")
        interfaces['localhost'] = '127.0.0.1'
    
    return interfaces

def get_system_network_info():
    """Get additional system network information"""
    system_info = {
        'hostname': socket.gethostname(),
        'platform': platform.system(),
        'machine': platform.machine()
    }
    
    # Try to get more detailed network info based on OS
    try:
        if platform.system() == "Windows":
            result = subprocess.run(['ipconfig'], capture_output=True, text=True, timeout=5)
            system_info['network_details'] = "Windows network config available"
        elif platform.system() == "Darwin":  # macOS
            result = subprocess.run(['ifconfig'], capture_output=True, text=True, timeout=5)
            system_info['network_details'] = "macOS network config available"
        elif platform.system() == "Linux":
            result = subprocess.run(['ip', 'addr'], capture_output=True, text=True, timeout=5)
            system_info['network_details'] = "Linux network config available"
    except:
        system_info['network_details'] = "Basic network info only"
    
    return system_info

def print_epic_banner():
    """Print an epic server banner"""
    banner = """
    ██╗   ██╗███╗   ██╗██╗██╗   ██╗███████╗██████╗ ███████╗ █████╗ ██╗     
    ██║   ██║████╗  ██║██║██║   ██║██╔════╝██╔══██╗██╔════╝██╔══██╗██║     
    ██║   ██║██╔██╗ ██║██║██║   ██║█████╗  ██████╔╝███████╗███████║██║     
    ██║   ██║██║╚██╗██║██║╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██╔══██║██║     
    ╚██████╔╝██║ ╚████║██║ ╚████╔╝ ███████╗██║  ██║███████║██║  ██║███████╗
     ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝
    
    🌍 UNIVERSAL NETWORK SERVER 🚀
    📡 WiFi • 🔗 Ethernet • 📱 Hotspot • 🌐 All Networks!
    """
    print(banner)

def print_comprehensive_server_info(port, interfaces, system_info):
    """Print comprehensive server information"""
    print("🚀 SERVER STATUS: ONLINE & BROADCASTING")
    print("📁 Serving directory:", os.getcwd())
    print("🌐 Port:", port)
    print("🖥️  System:", f"{system_info['platform']} ({system_info['machine']})")
    print("🏠 Hostname:", system_info['hostname'])
    print("=" * 80)
    
    # Local access
    print("💻 LOCAL ACCESS:")
    print(f"   🏠 http://127.0.0.1:{port}/idklmao")
    print(f"   🏠 http://localhost:{port}/idklmao")
    
    # Network interfaces
    print("\n🌍 NETWORK ACCESS (All Devices on ANY Connected Network):")
    
    if interfaces:
        for interface_name, ip in interfaces.items():
            network_emoji = get_network_emoji(ip)
            network_type = get_network_type(ip)
            print(f"   {network_emoji} http://{ip}:{port}/idklmao  ({interface_name} - {network_type})")
    else:
        print("   ⚠️  No external network interfaces detected")
    
    print("\n🔥 UNIVERSAL ACCESS FEATURES:")
    print("   📶 WiFi Networks - Share with phones, tablets, laptops")
    print("   🔗 Ethernet - Wired network access")
    print("   📱 Mobile Hotspot - When you're the hotspot")
    print("   🏢 Corporate Networks - Office/school networks")
    print("   🏠 Home Networks - Router-based networks")
    
    print("\n" + "=" * 80)
    print("🎯 CUSTOM ROUTE: /idklmao")
    print("📤 SHARE THESE URLs WITH ANY DEVICE!")
    print("🛑 Press Ctrl+C to stop the server")
    print("=" * 80)

def get_network_emoji(ip):
    """Get appropriate emoji for network type"""
    if ip.startswith("192.168."):
        return "📶"  # WiFi/Home
    elif ip.startswith("10."):
        return "🏢"  # Corporate
    elif ip.startswith("172."):
        return "🔗"  # Enterprise
    elif ip.startswith("169.254."):
        return "📱"  # Hotspot
    else:
        return "🌐"  # Other

def get_network_type(ip):
    """Get human-readable network type"""
    if ip.startswith("192.168."):
        return "Home/WiFi Network"
    elif ip.startswith("10."):
        return "Corporate Network"
    elif ip.startswith("172."):
        return "Enterprise Network"
    elif ip.startswith("169.254."):
        return "Hotspot/Ad-hoc"
    else:
        return "Public/Other Network"

def install_netifaces():
    """Try to install netifaces for better network detection"""
    try:
        print("📦 Installing netifaces for better network detection...")
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'netifaces'], 
                      check=True, capture_output=True)
        print("✅ netifaces installed successfully!")
        return True
    except:
        print("⚠️  Could not install netifaces, using basic network detection")
        return False

def auto_open_browser(port, interfaces, delay=3):
    """Auto-open browser with best URL"""
    def open_browser():
        time.sleep(delay)
        
        # Choose best URL to open
        url = f"http://127.0.0.1:{port}/idklmao"
        
        if interfaces:
            # If we have external interfaces, show the first one in console
            first_interface = list(interfaces.values())[0]
            print(f"🌐 Also available at: http://{first_interface}:{port}/idklmao")
        
        print(f"🚀 Opening browser: {url}")
        try:
            webbrowser.open(url)
        except:
            print("⚠️  Could not open browser automatically")
    
    thread = threading.Thread(target=open_browser)
    thread.daemon = True
    thread.start()

def check_required_files():
    """Enhanced file checking"""
    required_files = {
        'mainindex.html': 'Main calculator selector page',
        'normal/index.html': 'Normal calculator',
        'normal/script.js': 'Normal calculator logic',
        'normal/style.css': 'Normal calculator styles',
        'dumbass/index.html': 'Dumbass calculator',
        'dumbass/script.js': 'Dumbass calculator logic',
        'dumbass/style.css': 'Dumbass calculator styles'
    }
    
    missing_files = []
    
    for file_path, description in required_files.items():
        if not os.path.exists(file_path):
            missing_files.append((file_path, description))
    
    if missing_files:
        print("❌ ERROR: Missing required files:")
        for file_path, description in missing_files:
            print(f"   📄 {file_path} - {description}")
        print("\n💡 Make sure you're running this from the 'dumbass calculator' root folder!")
        print("📂 Current directory:", os.getcwd())
        return False
    
    print("✅ All required calculator files found!")
    return True

def check_port_availability(port):
    """Check if port is available"""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('', port))
        return True
    except:
        return False

def find_available_port(start_port=8008):
    """Find an available port starting from start_port"""
    for port in range(start_port, start_port + 100):
        if check_port_availability(port):
            return port
    return None

def main():
    """Enhanced main server function"""
    PORT = 8008
    
    # Print epic banner
    print_epic_banner()
    
    # Check required files
    if not check_required_files():
        sys.exit(1)
    
    # Check port availability
    if not check_port_availability(PORT):
        print(f"⚠️  Port {PORT} is busy, finding alternative...")
        PORT = find_available_port(8008)
        if not PORT:
            print("❌ Could not find an available port!")
            sys.exit(1)
        print(f"✅ Using port {PORT} instead")
    
    # Try to install netifaces for better network detection
    try:
        import netifaces
    except ImportError:
        install_netifaces()
    
    # Get comprehensive network information
    interfaces = get_all_network_interfaces()
    system_info = get_system_network_info()
    
    try:
        # Create server that binds to ALL interfaces
        with socketserver.TCPServer(("", PORT), UniversalHTTPRequestHandler) as httpd:
            httpd.allow_reuse_address = True
            
            print_comprehensive_server_info(PORT, interfaces, system_info)
            
            # Auto-open browser
            auto_open_browser(PORT, interfaces)
            
            # Start serving on ALL network interfaces
            print("🎯 Server starting on ALL network interfaces...")
            print("🌍 Broadcasting to WiFi, Ethernet, Hotspot, and all connected networks!")
            print("\n📡 Waiting for connections...")
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n🛑 Server gracefully stopped")
        print("👋 Thanks for using the Universal Calculator Server!")
        print("🎉 Hope you enjoyed calculating on the network!")
        
    except OSError as e:
        if e.errno in [48, 98]:  # Address already in use
            print(f"❌ ERROR: Port {PORT} is already in use!")
            print("💡 Try:")
            print("   1. Close other applications using this port")
            print("   2. Wait a few seconds and try again") 
            print("   3. Restart your computer if problem persists")
        else:
            print(f"❌ Network error: {e}")
        sys.exit(1)
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()