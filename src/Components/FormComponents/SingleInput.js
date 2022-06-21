import style from "./SingleInput.module.css";

export default function SingleInput(props)
{
    const{meta,label,renderInput}=props;

    return<div className={style.inputContainer}>
        <label>{label}</label>
        {renderInput({...props})}
        <div className={style.error}>{meta.touched && meta.error && !meta.active ? meta.error:""}</div>
    </div>
}