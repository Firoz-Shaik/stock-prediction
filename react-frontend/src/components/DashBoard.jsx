import { useEffect,useState } from 'react'
import axiosInstance from '../axiosInstance'

const DashBoard = () => {
    const [ticker, setTicker] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [plotImg, setPlotImg] = useState('');
    const [ma100, setMA100Url] = useState('');
    const [ma200, setMA200Url] = useState('');
    const [predictImg, setPredictImg] = useState('');
    const [mse,setMSE] = useState('');
    const [rmse,setRMSE] = useState('');
    const [r2, setR2] = useState('');
    useEffect(() => {
        const fetchData = async () => {
            try{
                const response = await axiosInstance.get('protected/');
                cosole.log('Protected data:', response.data);
            }catch(error){
                console.error('Error fetching protected data:', error);
            }
        }
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try{
            const response = await axiosInstance.post('predict/', { ticker: ticker });
            console.log('Prediction result:', response.data);
            const backendRoot = import.meta.env.VITE_BACKEND_ROOT
            const plotImgUrl = `${backendRoot}${response.data.plot_img}`;
            const ma100Url = `${backendRoot}${response.data.plot_100_dma}`;
            const ma200Url = `${backendRoot}${response.data.plot_200_dma}`;
            const predictImgUrl = `${backendRoot}${response.data.plot_prediction}`;
            setPlotImg(plotImgUrl);
            setMA100Url(ma100Url);
            setMA200Url(ma200Url);
            setPredictImg(predictImgUrl);
            setMSE(response.data.mse);
            setRMSE(response.data.rmse);
            setR2(response.data.r2);
            if (response.data.status === 'error') {
                setError(response.data.message);
            }
        }catch(error){
            console.error('Error during prediction:', error);
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
            <div className='prediction mt-5'>
                {plotImg && (
                    <div>
                        <h3>Stock Price Chart</h3>
                        <img src={plotImg} alt="Stock Price Chart" className='img-fluid' />
                    </div>
                )}
            </div>
            <div className='prediction mt-5'>
                {ma100 && (
                    <div>
                        <h3>100 Day Moving Average</h3>
                        <img src={ma100} alt="Stock Price Chart" className='img-fluid' />
                    </div>
                )}
            </div>
            <div className='prediction mt-5'>
                {ma200 && (
                    <div>
                        <h3>200 Day Moving Average</h3>
                        <img src={ma200} alt="Stock Price Chart" className='img-fluid' />
                    </div>
                )}
            </div>
            <div className='prediction mt-5'>
                {predictImg && (
                    <div>
                        <h3>Stock Price Prediction</h3>
                        <img src={predictImg} alt="Stock Price Chart" className='img-fluid' />
                    </div>
                )}
            </div>

            <div className='text-light p-3'>
                <h4>Model Evaluation</h4>
                <p>Mean Squared Error (MSE): {mse}</p>
                <p>Root Mean Squared Error (RMSE): RMSE: {rmse}</p>
                <p>R-Squared (R2): {r2}</p>
            </div>
        </div>
    </div>
  )
}

export default DashBoard