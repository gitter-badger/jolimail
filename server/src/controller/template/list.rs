use crate::error::ServerError;
use crate::model::template::Template;
use crate::service::database::client::Pool;
use actix_web::{get, web, HttpResponse};

#[get("/api/templates")]
pub async fn handler(pool: web::Data<Pool>) -> Result<HttpResponse, ServerError> {
    let pool: &Pool = &pool;
    let result = Template::list(pool).await?;
    Ok(HttpResponse::Ok().json(result))
}

#[cfg(test)]
mod tests {
    use crate::model::template::create::tests::create_template;
    use crate::model::template::Template;
    use crate::service::database::tests::reset_database;
    use crate::tests::execute_request;
    use actix_web::http::StatusCode;
    use actix_web::test;
    use serde_json::from_slice;

    #[actix_rt::test]
    #[serial]
    async fn success() {
        reset_database().await;
        let first = create_template("first", None).await;
        let second = create_template("second", None).await;
        let req = test::TestRequest::get().uri("/api/templates").to_request();
        let res = execute_request(req).await;
        assert_eq!(res.status(), StatusCode::OK);
        let body = test::read_body(res).await;
        let body: Vec<Template> = from_slice(body.as_ref()).unwrap();
        assert_eq!(body.len(), 2);
        assert_eq!(body.get(0).unwrap().id, second.id);
        assert_eq!(body.get(1).unwrap().id, first.id);
    }
}
