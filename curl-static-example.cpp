#include <iostream>
#include <fstream>
using namespace std;



#include <Windows.h>

#define CURL_STATICLIB // используется статическая сборка библиотеки

#include <stdio.h>
#include <curl/curl.h>

#ifdef _DEBUG
#pragma comment(lib,"libcurld.lib")
#else
#pragma comment(lib,"libcurl.lib")
#pragma comment(lib,"libeay32.lib")
#pragma comment(lib,"ssleay32.lib")
#endif

#pragma comment(lib,"ws2_32.lib")  // Зависимость от WinSocks2
#pragma comment(lib,"wldap32.lib")



static size_t WriteCallback(void *contents, size_t size, size_t nmemb, void *userp)
{
	((std::string*)userp)->append((char*)contents, size * nmemb);
	return size * nmemb;
}


void main() 
{
	CURL *curl;
	CURLcode res;
	std::string readBuffer;

	curl = curl_easy_init();
	if (curl) {
		curl_easy_setopt(curl, CURLOPT_URL, "http://www.google.com");
		curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
		curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);
		res = curl_easy_perform(curl);
		curl_easy_cleanup(curl);

		cout << readBuffer.data();
	}


	system("pause");
}
