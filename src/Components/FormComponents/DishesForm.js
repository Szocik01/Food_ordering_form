import { Field, reduxForm } from "redux-form";
import SingleInput from "./SingleInput";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import style from "./DishesForm.module.css";

function textInput(params) {
  const { input, type, step, min, max, meta} = params;
  
  return (
    <input className={`${style.input} ${!meta.valid && meta.touched ? style.error : ""}`}
      {...input}
      type={type}
      step={step ? step : ""}
      min={min || min === "0" ? min : ""}
      max={max || max === "0" ? max : ""}
    />
  );
}

function selectInput(params) {
  const { input, children } = params;

  return <select {...input} className={style.input}>{children}</select>;
}

const validateInputs = (values) => {
  const errors = {};

  if (!values.dishName || values.dishName.trim() === "") {
    errors.dishName = "Required";
  }

  if (!values.preparation || values.preparation === "00:00:00") {
    errors.preparation = "Required";
  }

  if (!values.slices) {
    errors.slices = "Required";
  } else if (values.slices < 0 || values.slices > 12) {
    errors.slices = "Wrong number";
  }

  if(values.spiceness<0 || values.spiceness>10)
  {
    errors.spiceness="Wrong number";
  }

  if (!values.diameter) {
    errors.diameter = "Required";
  } else if (values.diameter <= 20 || values.diameter > 60) {
    errors.diameter = "Wrong number";
  }

  if (!values.breadSlices) {
    errors.breadSlices = "Required";
  } else if (values.breadSlices <= 0 || values.breadSlices > 6) {
    errors.breadSlices = "Wrong number";
  }

  return errors;
};

let DishesForm = ({ handleSubmit, submitting }) => {
  const [httpInfo, setHttpInfo] = useState("");
  const [selectedDish, setSelectedDish] = useState("pizza");

  const formData = useSelector((state) => {
    return state.form.dishes;
  });

  useEffect(() => {
    if(formData.values && formData.values.dishType)
    {
      setHttpInfo("");
      setSelectedDish(formData.values.dishType);
    }
  }, [formData.values]);

  const optionsTable=[{name:"Pizza", value:"pizza"},{name:"Soup", value:"soup"},{name:"Sandwich", value:"sandwich"}];

  const onSubmitHandler = async () => {
    setHttpInfo("");

    const dataToBeSend = {
      name: formData.values.dishName,
      preparation_time: formData.values.preparation,
      type: selectedDish,
    };

    switch (selectedDish) {
        case "pizza":
            dataToBeSend.no_of_slices= +formData.values.slices;
            dataToBeSend.diameter= +formData.values.diameter;
            break;
        case "soup":
            formData.values.spiceness?dataToBeSend.spiciness_scale=+formData.values.spiceness:dataToBeSend.spiciness_scale=5;
            break;
        case "sandwich":
            dataToBeSend.slices_of_bread=+formData.values.breadSlices;
            break;
    }

    try {
      const response = await fetch(
        "https://frosty-wood-6558.getsandbox.com:443/dishes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToBeSend),
        }
      );
      if (!response.ok) {
        throw new Error(
          `Błąd wysyłania treści do serwera. Kod błędu: ${response.status}`
        );
      }
      const data = await response.json();
      setHttpInfo("Zapytanie wysłane poprawnie");
      alert(JSON.stringify(data));
    } catch (error) {
      setHttpInfo(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className={style.form}>
        <span className={style.header}>Food Ordering Form</span>
      <Field
        name="dishName"
        label="Dish Name"
        type="text"
        renderInput={textInput}
        component={SingleInput}/>
      <Field
        name="preparation"
        label="Preparation Time"
        type="time"
        step="1"
        renderInput={textInput}
        component={SingleInput}/>
      <Field
        name="dishType"
        label="Dish Type"
        renderInput={selectInput}
        component={SingleInput}>
          {optionsTable.map((item,index)=>{
            return <option value={item.value} key={index}>{item.name}</option>
          })}
      </Field>
      {selectedDish === "pizza" ? (
        <Field
          name="slices"
          label="Slices"
          type="number"
          step="1"
          renderInput={textInput}
          component={SingleInput}/>
      ) : (
        ""
      )}

      {selectedDish === "pizza" ? (
        <Field
          name="diameter"
          label="Diameter"
          type="number"
          step="0.1"
          renderInput={textInput}
          component={SingleInput}/>
      ) : (
        ""
      )}
      {selectedDish === "soup" ? (
        <Field
          name="spiceness"
          label="Spiceness"
          type="range"
          step="1"
          min="0"
          max="10"
          renderInput={textInput}
          component={SingleInput}/>
      ) : (
        ""
      )}
      {selectedDish === "sandwich" ? (
        <Field
          name="breadSlices"
          label="Bread Slices"
          type="number"
          step="1"
          renderInput={textInput}
          component={SingleInput}/>
      ) : (
        ""
      )}

      <button className={style.submitButton} type="submit" disabled={submitting} >
        Submit
      </button>
      {httpInfo ? <div className={style.httpInfo}>{httpInfo}</div> : ""}
    </form>
  );
};

DishesForm = reduxForm({
  form: "dishes",
  destroyOnUnmount: false,
  validate: validateInputs,
})(DishesForm);

export default DishesForm;