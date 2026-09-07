from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import StockPredictionSerializer
import yfinance as yf 
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime
import os 
from .utils import save_plot
from sklearn.preprocessing import MinMaxScaler
from keras.models import load_model
from sklearn.metrics import mean_squared_error, r2_score

# Create your views here.

class StockPredictionView(APIView):
    def post(self, request):
        serializer = StockPredictionSerializer(data=request.data)
        if serializer.is_valid():
            ticker = serializer.validated_data['ticker']        
        now = datetime.now()
        start_date = datetime(now.year - 10, now.month, now.day)
        df = yf.download(ticker, start=start_date, end=now)
        if df.empty:
            return Response({"status": "error", "message": "Invalid ticker symbol or no data available."}, status=status.HTTP_400_BAD_REQUEST)
        df = df.reset_index()
        # Generate a simple plot of the stock's closing price
        plt.switch_backend('AGG')  # Use a non-interactive backend for matplotlib
        plt.figure(figsize=(12,5))
        plt.plot(df.Close)
        plt.title(f'Closing Price for {ticker}') 
        plt.xlabel('Day')
        plt.ylabel('Closing Price')
        plot_img_path = f'{ticker}_closing_price.png'
        plot_img = save_plot(plot_img_path)

        #100 Days Moving average 
        MA_100 = df['Close'].rolling(100).mean()
        plt.switch_backend('AGG')  # Use a non-interactive backend for matplotlib
        plt.figure(figsize=(12,5))
        plt.plot(df.Close)
        plt.plot(MA_100, 'r', label='MA 100')
        plt.title(f'100 Days Moving Average of {ticker}') 
        plt.xlabel('Day')
        plt.ylabel('Closing Price')
        plt.legend()
        plot_img_path = f'{ticker}_moving_average_100.png'
        plot_100_dma = save_plot(plot_img_path)

        #200 Days Moving average
        MA_200 = df['Close'].rolling(200).mean()
        plt.switch_backend('AGG')  # Use a non-interactive backend for matplotlib
        plt.figure(figsize=(12,5))
        plt.plot(df.Close)
        plt.plot(MA_100, 'r', label='MA 100')
        plt.plot(MA_200, 'g', label='MA 200')
        plt.title(f'200 Days Moving Average of {ticker}')
        plt.xlabel('Day')
        plt.ylabel('Closing Price')
        plt.legend()
        plot_img_path = f'{ticker}_moving_average_200.png'
        plot_200_dma = save_plot(plot_img_path)

        #Splitting training and testing data
        data_train = pd.DataFrame(df.Close[0:int(len(df)*0.7)])
        data_test = pd.DataFrame(df.Close[int(len(df)*0.7):int(len(df))])

        #Scaling down the data between 0 and 1
        scaler = MinMaxScaler(feature_range=(0,1))


        #Load ML model
        model = load_model('stock_prediction_model.keras')

        #Preparing test data
        past_100_days = data_train.tail(100)
        final_df = pd.concat([past_100_days, data_test], ignore_index=True)
        input_data = scaler.fit_transform(final_df)
        x_test = []
        y_test = []

        for i in range(100,input_data.shape[0]):
            x_test.append(input_data[i-100:i])
            y_test.append(input_data[i,0])
        x_test, y_test = np.array(x_test), np.array(y_test)

        #Prediction
        y_predict = model.predict(x_test)

        #Unscaling the data
        y_predict = scaler.inverse_transform(y_predict.reshape(-1,1)).flatten()
        y_test = scaler.inverse_transform(y_test.reshape(-1,1)).flatten()

        #Plotting the prediction
        plt.figure(figsize=(12,5))
        plt.plot(y_test, 'b', label='Original Price')
        plt.plot(y_predict, 'r', label='Predicted Price')
        plt.title(f'Final Prediction for {ticker}')
        plt.xlabel('Time')
        plt.ylabel('Price')
        plt.legend()
        plot_img_path = f'{ticker}_prediction.png'
        plot_prediction = save_plot(plot_img_path)

        #Model Evaluation
        mse = mean_squared_error(y_test, y_predict)
        #Root Mean Squared Error
        rmse = np.sqrt(mse)

        #R-Squared
        r2 = r2_score(y_test, y_predict)

        return Response({
            "status": "success", 
            "plot_img": plot_img, 
            "plot_100_dma": plot_100_dma,
            "plot_200_dma": plot_200_dma,
            "plot_prediction": plot_prediction,
            "mse": mse,
            "rmse": rmse,
            "r2": r2,
            })