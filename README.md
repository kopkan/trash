# trash

 * #include <windows.h>
    {
        HANDLE mutex = ::CreateMutexA(NULL, FALSE, (char*)"MyMutex");
        if (WaitForSingleObject(mutex, 10000) != WAIT_OBJECT_0){}

        HANDLE semaphore = ::CreateSemaphoreA(NULL, 4, 4, (char*)"MySemaphore");
        if(WaitForSingleObject(semaphore, 10000)!=WAIT_OBJECT_0){}


        long currentCount=-1;
        qDebug()<<::ReleaseSemaphore(semaphore, 1, &currentCount);
        HANDLE semaphore2 = ::CreateSemaphoreA(NULL, 4, 4, (char*)"MySemaphore");
        if(WaitForSingleObject(semaphore2, 10000)!=WAIT_OBJECT_0){}

        //ReleaseMutex(mutex);
        CloseHandle(mutex);

        QMessageBox msgBox;
        msgBox.setText(QString::number(currentCount));
        msgBox.exec();
        qDebug()<<::ReleaseSemaphore(semaphore, 1, &currentCount);
    }
