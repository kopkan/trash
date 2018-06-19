// Example program
#include <iostream>
#include <string>
#include <vector>
#include <sstream>

template<typename Out>
void split(const std::string &s, char delim, Out result) {
	std::stringstream ss(s);
	std::string item;
	while (std::getline(ss, item, delim)) {
		*(result++) = item;
	}
}

std::vector<std::string> split(const std::string &s, char delim) {
	std::vector<std::string> elems;
	split(s, delim, std::back_inserter(elems));
	return elems;
}

int main()
{
	std::string allString;
	std::cout << "VVOD STRIKI? ";
	getline(std::cin, allString);
	std::cout << "STROKA=, " << allString << "!\n";


	auto words = split(allString, ' ');

	for (int i = 0; i<words.size(); i++)
	{
		if (words[i].size()>0 && words[i].size() % 2 == 0) {
			std::cout << "word=" << words[i] << "!\n";
		}
	}

	system("pause");
}
