#pragma once

#include <Windows.h>
#include <string>
#include <intrin.h>


namespace systeminfo
{
	class Windows
	{
	public:
		inline static string verison()
		{
			OSVERSIONINFOEX osver;
			BOOL bIsWindowsXPorLater;

			memset(&osver, 0, sizeof(osver));
			osver.dwOSVersionInfoSize = sizeof(osver);
			GetVersionEx((LPOSVERSIONINFO)&osver);

			SYSTEM_INFO sysInfo;
			{
				typedef void(__stdcall *GETSYSTEMINFO) (LPSYSTEM_INFO);
				GETSYSTEMINFO getSysInfo = (GETSYSTEMINFO)GetProcAddress(GetModuleHandle("kernel32.dll"), "GetNativeSystemInfo");
				if (getSysInfo == NULL)  getSysInfo = ::GetSystemInfo;
				getSysInfo(&sysInfo);
			}

			std::string  winver;

			if (osver.dwMajorVersion == 10 && osver.dwMinorVersion >= 0 && osver.wProductType != VER_NT_WORKSTATION)  winver = "Windows 10 Server";
			if (osver.dwMajorVersion == 10 && osver.dwMinorVersion >= 0 && osver.wProductType == VER_NT_WORKSTATION)  winver = "Windows 10";
			if (osver.dwMajorVersion == 6 && osver.dwMinorVersion == 3 && osver.wProductType != VER_NT_WORKSTATION)  winver = "Windows Server 2012 R2";
			if (osver.dwMajorVersion == 6 && osver.dwMinorVersion == 3 && osver.wProductType == VER_NT_WORKSTATION)  winver = "Windows 8.1";
			if (osver.dwMajorVersion == 6 && osver.dwMinorVersion == 2 && osver.wProductType != VER_NT_WORKSTATION)  winver = "Windows Server 2012";
			if (osver.dwMajorVersion == 6 && osver.dwMinorVersion == 2 && osver.wProductType == VER_NT_WORKSTATION)  winver = "Windows 8";
			if (osver.dwMajorVersion == 6 && osver.dwMinorVersion == 1 && osver.wProductType != VER_NT_WORKSTATION)  winver = "Windows Server 2008 R2";
			if (osver.dwMajorVersion == 6 && osver.dwMinorVersion == 1 && osver.wProductType == VER_NT_WORKSTATION)  winver = "Windows 7";
			if (osver.dwMajorVersion == 6 && osver.dwMinorVersion == 0 && osver.wProductType != VER_NT_WORKSTATION)  winver = "Windows Server 2008";
			if (osver.dwMajorVersion == 6 && osver.dwMinorVersion == 0 && osver.wProductType == VER_NT_WORKSTATION)  winver = "Windows Vista";
			if (osver.dwMajorVersion == 5 && osver.dwMinorVersion == 2 && osver.wProductType == VER_NT_WORKSTATION
				&&  sysInfo.wProcessorArchitecture == PROCESSOR_ARCHITECTURE_AMD64)  winver = "Windows XP x64";
			if (osver.dwMajorVersion == 5 && osver.dwMinorVersion == 2)   winver = "Windows Server 2003";
			if (osver.dwMajorVersion == 5 && osver.dwMinorVersion == 1)   winver = "Windows XP";
			if (osver.dwMajorVersion == 5 && osver.dwMinorVersion == 0)   winver = "Windows 2000";
			if (osver.dwMajorVersion < 5)   winver = "unknown";

			return winver;
		}

		inline static std::string architecture()
		{
			SYSTEM_INFO sysinfo;
			GetNativeSystemInfo(&sysinfo);

			std::string architecture;
			switch (sysinfo.wProcessorArchitecture)
			{
			case PROCESSOR_ARCHITECTURE_AMD64:
				architecture = "AMD64";
				break;
			case PROCESSOR_ARCHITECTURE_ARM:
				architecture = "ARM";
				break;
			case PROCESSOR_ARCHITECTURE_IA64:
				architecture = "IA64";
				break;
			case PROCESSOR_ARCHITECTURE_INTEL:
				architecture = "INTEL";
				break;
			case PROCESSOR_ARCHITECTURE_UNKNOWN:
				architecture = "UNKNOWN";
				break;
			default:
				architecture = "num=" + std::to_string(sysinfo.wProcessorArchitecture);
				break;
			}
			return architecture;
		}
	};

	class HDD 
	{
	public:
		//http://www.sources.ru/builder/faq/012.html
		inline static int fixedSize()
		{
			int totalFixedSize = 0;
			string dirNames = "QWERTYUIOPASDFGHJKLZXCVBNM";
			for (int i = 0; i < dirNames.size(); i++)
			{
				char currentCat[] = "C:\\";
				currentCat[0] = dirNames.at(i);

				UINT drive_type = GetDriveType(currentCat); // узнаём тип диска

				if (drive_type > 1) {
					/*
					string out = "type: ";
					if (drive_type == DRIVE_REMOVABLE) out += "REMOVABLE";
					else if (drive_type == DRIVE_FIXED)	 out += "FIXED";
					else if (drive_type == DRIVE_REMOTE)	out += "REMOTE";
					else if (drive_type == DRIVE_CDROM)	 out += "CD-ROM";
					else if (drive_type == DRIVE_RAMDISK)   out += "RAMDISK";
					else out += to_string(drive_type);
					cout << out << endl;
					*/
					if (drive_type == DRIVE_FIXED)
					{
						ULARGE_INTEGER FreeBytesAvailable = { 0,0 };
						ULARGE_INTEGER TotalNumberOfBytes = { 0,0 };
						ULARGE_INTEGER TotalNumberOfFreeBytes = { 0,0 };

						if (GetDiskFreeSpaceEx(
							currentCat,
							&FreeBytesAvailable,
							&TotalNumberOfBytes,
							&TotalNumberOfFreeBytes))
						{
							//cout << currentCat << endl;
							totalFixedSize += TotalNumberOfBytes.QuadPart / 1024 / 1024 / 1024;
						}
					}
				}
			}
			return totalFixedSize;
		}
	};

	class CPU
	{
	public:
		inline static unsigned long numberOfProcessors()
		{
			SYSTEM_INFO sysinfo;
			GetNativeSystemInfo(&sysinfo);
			return sysinfo.dwNumberOfProcessors;
		}


		inline static std::string vendorString()
		{
			std::string VendorString;
			cpuid_regs Regs;
			__cpuid((int *)&Regs, 0x80000000);
			if (Regs.Eax >= 0x80000004)
			{
				VendorString =
					GetCpuVendorSubstring(0x80000002) +
					GetCpuVendorSubstring(0x80000003) +
					GetCpuVendorSubstring(0x80000004)
					;
			}
			return VendorString;
		}

		inline static std::string vendorStringRegedit()
		{
			char Buffer[_MAX_PATH];
			DWORD BufSize = _MAX_PATH;
			char name[_MAX_PATH];
			HKEY hKey;

			// open the key where the proc speed is hidden:
			long lError = RegOpenKeyEx(HKEY_LOCAL_MACHINE,
				"HARDWARE\\DESCRIPTION\\System\\CentralProcessor\\0",
				0,
				KEY_READ,
				&hKey);
			if (lError != ERROR_SUCCESS)
			{// if the key is not found, tell the user why:
				FormatMessage(FORMAT_MESSAGE_FROM_SYSTEM,
					NULL,
					lError,
					0,
					Buffer,
					_MAX_PATH,
					0);
				//cout << "error=" << Buffer << endl;
				return "";
			}

			// query the key:
			RegQueryValueExA(hKey, "ProcessorNameString", NULL, NULL, (LPBYTE)&name, &BufSize);
			return name;
		}

		inline static double speedRegedit()
		{
			char Buffer[_MAX_PATH];
			DWORD BufSize = _MAX_PATH;
			DWORD dwMHz = _MAX_PATH;
			HKEY hKey;

			// open the key where the proc speed is hidden:
			long lError = RegOpenKeyEx(HKEY_LOCAL_MACHINE,
				"HARDWARE\\DESCRIPTION\\System\\CentralProcessor\\0",
				0,
				KEY_READ,
				&hKey);
			if (lError != ERROR_SUCCESS)
			{// if the key is not found, tell the user why:
				FormatMessage(FORMAT_MESSAGE_FROM_SYSTEM,
					NULL,
					lError,
					0,
					Buffer,
					_MAX_PATH,
					0);
				//cout << "error=" << Buffer << endl;
				return 0;
			}

			// query the key:
			RegQueryValueEx(hKey, "~MHz", NULL, NULL, (LPBYTE)&dwMHz, &BufSize);
			return (double)dwMHz;
		}

		inline static int cache() {
			size_t cache = 0;
			DWORD buffer_size = 0;
			DWORD i = 0;
			SYSTEM_LOGICAL_PROCESSOR_INFORMATION * buffer = 0;

			GetLogicalProcessorInformation(0, &buffer_size);
			buffer = (SYSTEM_LOGICAL_PROCESSOR_INFORMATION *)malloc(buffer_size);
			GetLogicalProcessorInformation(&buffer[0], &buffer_size);

			for (i = 0; i != buffer_size / sizeof(SYSTEM_LOGICAL_PROCESSOR_INFORMATION); ++i) {
				if (buffer[i].Relationship == RelationCache && buffer[i].Cache.Level == 3) {
					cache = buffer[i].Cache.Size / 1024;
					break;
				}
			}
			free(buffer);
			return cache;
		}

		// Returns 1.0f for "CPU fully pinned", 0.0f for "CPU idle", or somewhere in between
		// You'll need to call this at regular intervals, since it measures the load between
		// the previous call and the current one.  Returns -1.0 on error.
		inline int static loadPercent()
		{
			FILETIME idleTime, kernelTime, userTime;
			float load = GetSystemTimes(&idleTime, &kernelTime, &userTime) ? CalculateCPULoad(FileTimeToInt64(idleTime), FileTimeToInt64(kernelTime) + FileTimeToInt64(userTime)) : -1.0f;
			return load*100;
		}

	private:
		struct cpuid_regs
		{
			DWORD   Eax;
			DWORD   Ebx;
			DWORD   Ecx;
			DWORD   Edx;
		};

		inline static std::string SplitIntoChars(DWORD Value)
		{
			std::string Str;
			char const * pCursor = (char const *)&Value;
			for (int i = 0; i < sizeof(Value); ++i) {
				Str += pCursor[i];
			}
			return Str;
		}

		inline static std::string GetCpuVendorSubstring(DWORD Eax)
		{
			cpuid_regs Regs;
			__cpuid((int *)&Regs, Eax);
			std::string Str;
			Str += SplitIntoChars(Regs.Eax);
			Str += SplitIntoChars(Regs.Ebx);
			Str += SplitIntoChars(Regs.Ecx);
			Str += SplitIntoChars(Regs.Edx);
			return Str;
		}

		inline static float CalculateCPULoad(unsigned long long idleTicks, unsigned long long totalTicks)
		{
			static unsigned long long _previousTotalTicks = 0;
			static unsigned long long _previousIdleTicks = 0;

			unsigned long long totalTicksSinceLastTime = totalTicks - _previousTotalTicks;
			unsigned long long idleTicksSinceLastTime = idleTicks - _previousIdleTicks;

			float ret = 1.0f - ((totalTicksSinceLastTime > 0) ? ((float)idleTicksSinceLastTime) / totalTicksSinceLastTime : 0);

			_previousTotalTicks = totalTicks;
			_previousIdleTicks = idleTicks;
			return ret;
		}

		inline static unsigned long long FileTimeToInt64(const FILETIME & ft) { return (((unsigned long long)(ft.dwHighDateTime)) << 32) | ((unsigned long long)ft.dwLowDateTime); }
	};


	class RAM 
	{
	public:
		inline static int loadPercent()
		{
			return getStat().dwMemoryLoad;
		}

		inline static int physicalSize()
		{
			return getStat().ullTotalPhys/1024/1024;
		}

	private:
		inline static MEMORYSTATUSEX getStat()
		{
			MEMORYSTATUSEX statex;
			statex.dwLength = sizeof(statex);
			GlobalMemoryStatusEx(&statex);
			return statex;
			/* 
            #define DIV (1024*1024)
			cout << "There is ld percent of memory in use=" << statex.dwMemoryLoad << endl;
			cout << "There are %*I64d total KB of physical memory=" << statex.ullTotalPhys / DIV << endl;
			cout << "There are %*I64d free  KB of physical memory=" << statex.ullAvailPhys / DIV << endl;
			cout << "There are %*I64d total KB of paging file=" << statex.ullTotalPageFile / DIV << endl;
			cout << "There are %*I64d free  KB of paging file=" << statex.ullAvailPageFile / DIV << endl;
			cout << "There are %*I64d total KB of virtual memory=" << statex.ullTotalVirtual / DIV << endl;
			cout << "There are %*I64d free  KB of virtual memory=" << statex.ullAvailVirtual / DIV << endl;

			// Show the amount of extended memory available.

			cout << "There are %*I64d free  KB of extended memory." << statex.ullAvailExtendedVirtual / DIV << endl;
			*/
		}
	};
}
