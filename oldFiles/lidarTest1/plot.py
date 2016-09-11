import matplotlib 
import math
import signal
from mpl_toolkits.mplot3d import Axes3D
import numpy as np
import matplotlib.pyplot as plt

class pointObject:
    def __init__(self):
        self.x = []
        self.y = []

# creates a border based on the x and y values
# currently does not allow different x and y values
def createBorder(xValue, yValue):
    # creating a list
    testList = pointObject()

    # top
    temp = -1 * xValue/2 
    for i in range(0, xValue):
        testList.x.append(temp)
        temp += 1

    temp = yValue/2
    for i in range(0, yValue):
        testList.y.append(temp)

    # bottom
    temp = -1 * xValue/2
    for i in range(0, xValue):
        testList.x.append(temp)
        temp += 1

    temp = -yValue/2
    for i in range(0, yValue):
        testList.y.append(temp)

    # left
    temp = -1 * xValue/2 
    for i in range(0, xValue):
        testList.x.append(temp)

    temp = -1 * yValue/2
    for i in range(0, yValue):
        testList.y.append(temp)
        temp += 1

    # right
    temp = xValue/2 
    for i in range(0, xValue + 1):
        testList.x.append(temp)

    temp = yValue/2
    for i in range(0, yValue + 1):
        testList.y.append(temp)
        temp -= 1

    return testList

# TODO: finish this later
# def createGrid(xValue, yValue):
#     testList = pointObject()
#     length = xValue * yValue

#     xStart = -1 * xValue/2
#     yStart = yValue/2

#     tempx = xStart
#     tempy = yStart
#     for i in range(0, length):
#         if(tempx == (xValue/2)):
#             tempx = xStart
#             tempy -= 1

#         testList.x.append(tempx)
#         testList.y.append(tempy)


max_value = 1000
count = 0;
angle = []
distance = []

x = []
y = []

rf = open("processed.txt")
# wf = open("out.txt","w")
# for line in rf:
#     newline = line.rstrip('\r\n')
#     newline = newline.replace(',', ' ')
#     somelist = newline.split()
#     for polarData in somelist:
#     	if count == 0:
#     		angle.append(polarData)
#     		count = 1
#     	else:
#     	   distance.append(polarData)
#     	   count = 0

for line in rf:
    newline = line.rstrip('\r\n')
    newline = newline.replace(',', ' ')
    somelist = newline.split()
    for polarData in somelist:
        if count == 0:
            x.append(polarData)
            count = 1
        else:
           y.append(polarData)
           count = 0


# ------------------------------------------------------------
# i = 0
# delete_list = []
# for each in distance:
#     if(abs(int(each)) > max_value):
#         distance.remove(each)
#         delete_list.append(i)
#     i += 1

# delete_list.sort(reverse=True)
# for each in delete_list:
#     del angle[each]


# i = 0
# for stuff in angle:
# 	temp = float(angle[i])
# 	temp = math.cos(math.radians(temp))
# 	x.append(float(distance[i]) * temp)
# 	temp = float(angle[i])
# 	temp = math.sin(math.radians(temp))
# 	y.append(float(distance[i]) * temp)
# 	i+=1
# ------------------------------------------------------------



# remove outliers
# i = 0
# max_value = 1000
# delete_list = []
# for each in y:
#     if(abs(each) > max_value):
#         y.remove(each)
#         delete_list.append(i)
#     i += 1

# print("this is x\n")
# for each in x:
#     print(each)

# delete_list.sort(reverse=True)
# for each in delete_list:
#     del x[each]

# print("this is y\n")
# for each in y:
#     print(each)

# i = 0
# delete_list = []
# for each in x:
#     if(abs(each) > max_value):
#         x.remove(each)
#         delete_list.append(i)
#     i += 1

# delete_list.sort(reverse=True)
# for each in delete_list:
#     del y[each]


# mpl.rcParams['legend.fontsize'] = 100
# fig = plt.figure()
# ax = fig.gca(projection='3d')
# # theta = np.linspace(-4 * np.pi, 4 * np.pi, 100)
# # z = np.linspace(-2, 2, 100)
# # r = z**2 + 1
# # x = r * np.sin(theta)
# # y = r * np.cos(theta)
# z = 0;
# ax.scatter(x, y)
# # # ax.legend()

# plt.show()




# use this later
# ax = fig.gca(projection='3d')
# ax.scatter(x, y, len())
# ax.legend()
# plt.show()

# doing some testing here
borderWidth = 1000

# ------------------------------------------------------------
# returnedList = createBorder(borderWidth, borderWidth)
# returnedList = createGrid(borderWidth, borderWidth)
# x = returnedList.x
# y = returnedList.y

matplotlib.pyplot.scatter(x,y)

# plots a dot at the origin
# ------------------------------------------------------------
# test0 = [0]
# test1 = [0]
# matplotlib.pyplot.scatter(test0, test1)

# closes the program after 15s
# signal.alarm(10)

matplotlib.pyplot.show()

