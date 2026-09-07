import { useEffect, useState } from 'react'
import axiosInstance from '../axiosInstance'

const DashBoard = () => {
    const [ticker, setTicker] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            try{
                const response = await axiosInstance.get('protected/');
                console.log('Protected data:', response.data);
            }catch(error){
                console.error('Error fetching protected data:', error);
            }
        }
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const enteredTicker = ticker.trim().toUpperCase();
        setTicker(enteredTicker);
        setPrediction(null);
        setError('');
        setLoading(true);
        try{
            const response = await axiosInstance.post('predict/', { ticker: enteredTicker });
            console.log('Prediction result:', response.data);
            const backendRoot = import.meta.env.VITE_BACKEND_ROOT
            if (response.data.status !== 'success') {
                setError(`No stock name was found with entered ticker value: ${enteredTicker}`);
                return;
            }

            setPrediction({
                plotImg: `${backendRoot}${response.data.plot_img}`,
                ma100: `${backendRoot}${response.data.plot_100_dma}`,
                ma200: `${backendRoot}${response.data.plot_200_dma}`,
                predictImg: `${backendRoot}${response.data.plot_prediction}`,
                mse: response.data.mse,
                rmse: response.data.rmse,
                r2: response.data.r2,
            });
        }catch(error){
            console.error('Error during prediction:', error);
            if (error.response?.status === 400) {
                setError(`No stock name was found with entered ticker value: ${enteredTicker}`);
            } else {
                setError('Unable to get a prediction right now. Please try again.');
            }
        }finally{
            setLoading(false);
        }
    }

  return (
    <div className='container'>
        <div className='row'>   
            <div className='col-md-12 mx-auto bg-light-dark p-4 rounded mt-5'>
                <form onSubmit={handleSubmit}>
                    <input type="text" className='form-control' placeholder='Enter stock Ticker' onChange={(e) => setTicker(e.target.value)} required/>
                    <small className='text-danger'>{error && <div className='text-danger'>{error}</div>}</small>
                    <button type="submit" className='btn btn-info d-block mx-auto mt-3' disabled={loading}>
                        {loading ? 'Predicting...' : 'Predict'}
                    </button>
                </form>
            </div>
            {prediction && (
                <>
                <div className='prediction mt-5'>
                    <div>
                        <h3>Stock Price Chart</h3>
                        <img src={prediction.plotImg} alt="Stock Price Chart" className='img-fluid' />
                    </div>
                </div>
                <div className='prediction mt-5'>
                    <div>
                        <h3>100 Day Moving Average</h3>
                        <img src={prediction.ma100} alt="Stock Price Chart" className='img-fluid' />
                    </div>
                </div>
                <div className='prediction mt-5'>
                    <div>
                        <h3>200 Day Moving Average</h3>
                        <img src={prediction.ma200} alt="Stock Price Chart" className='img-fluid' />
                    </div>
                </div>
                <div className='prediction mt-5'>
                    <div>
                        <h3>Stock Price Prediction</h3>
                        <img src={prediction.predictImg} alt="Stock Price Prediction" className='img-fluid' />
                    </div>
                </div>
                <div className='text-light p-3'>
                    <h4>Model Evaluation</h4>
                    <p>Mean Squared Error (MSE): {prediction.mse}</p>
                    <p>Root Mean Squared Error (RMSE): {prediction.rmse}</p>
                    <p>R-Squared (R2): {prediction.r2}</p>
                </div>
                </>
            )}
        </div>
    </div>
  )
}

export default DashBoard